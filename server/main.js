#!/usr/bin/env node
'use strict';

var config = {
    nodeIp: '127.0.0.1',
    nodePort: 3000,
    dbHost: '127.0.0.1',
    dbPort: '3306',
    dbUser: 'root',
    dbPassword: 'root',
    sessionSecret: 'sessionSecret'
};

// database connection
var mysql = require('mysql');
var jimp = require('jimp');
var connection = mysql.createConnection({
    host: config.dbHost,
    port: config.dbPort,
    user: config.dbUser,
    password: config.dbPassword
});
connection.connect();

var express = require('express');
var app = express();

var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

// parse file uploads
var multer = require('multer');
app.use(multer({
    inMemory: true,
    includeEmptyFields: true
}));

// authentication stuff
var passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    cookieParser = require('cookie-parser'),
    session = require('express-session'),
    bcrypt = require('bcrypt-nodejs');

// TODO change connection to https
// Because we are hosting the app in openshift, https certification is handled by it automatically

passport.use(new LocalStrategy(
    function (username, password, done) {
        connection.query('select password_hash from tucha.user where username=' + mysql.escape(username), function (err, rows) {
            if (err) {
                return done(err);
            } else if (rows.length === 0) {
                return done(null, false);
            } else if (bcrypt.compareSync(password, rows[0].password_hash)) {
                return done(null, {username: username, password: password});
            } else {
                return done(null, false);
            }
        });
    }
));
passport.serializeUser(function (user, done) {
    done(null, user);
});
passport.deserializeUser(function (user, done) {
    done(null, user);
});
app.use(express.static('public'));
app.use(cookieParser());
app.use(bodyParser());
app.use(session({secret: config.sessionSecret}));
app.use(passport.initialize());
app.use(passport.session());

app.post('/r/login',
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/#/login',
        failureFlash: true
    })
);

app.get('/r/logout', function (req, res) {
    req.logout();
    res.redirect('/#/login');
});

function auth(req, res, next) {
    if (!req.isAuthenticated()) {
        res.send(401);
    } else {
        next();
    }
}

// http://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}

function query(sql, res, shuffle) {
    console.log(sql);
    connection.query(sql, function (err, rows) {
        if (err) {
            console.log(err);
            return;
        }
        if (shuffle) {
            shuffleArray(rows);
        }
        res.json(rows);
    });
}

function logQueryError(err) {
    if (err) {
        console.log(err);
    }
}

function storeImage(id, buffer, callback) {

    connection.query('delete from tucha.photos where id=' + id, function () {
        connection.query('insert into tucha.photos set ?', {id: id}, function (err) {
            if (err) {
                console.log(err);
                return;
            }

            new jimp(buffer, function (err, image) {
                var ratio, pw, ph,
                    w = image.bitmap.width,
                    h = image.bitmap.height;

                if (w > h) {
                    ratio = 800 / w;
                } else {
                    ratio = 800 / h;
                }
                pw = w * ratio;
                ph = h * ratio;
                image.resize(pw, ph).getBuffer(jimp.MIME_JPEG, function (err, resizedBuffer) {
                    var sql = 'update tucha.photos set photo=? where id=' + id;
                    sql = mysql.format(sql, [resizedBuffer]);
                    connection.query(sql, logQueryError);
                });

                ratio = 500 / h;
                pw = w * ratio;
                ph = h * ratio;
                image.resize(pw, ph).getBuffer(jimp.MIME_JPEG, function (err, resizedBuffer) {
                    var sql = 'update tucha.photos set photo_h500=? where id=' + id;
                    sql = mysql.format(sql, [resizedBuffer]);
                    connection.query(sql, logQueryError);
                });

                ratio = 250 / w;
                pw = w * ratio;
                ph = h * ratio;
                image.resize(pw, ph).getBuffer(jimp.MIME_JPEG, function (err, resizedBuffer) {
                    var sql = 'update tucha.photos set photo_w250=? where id=' + id;
                    sql = mysql.format(sql, [resizedBuffer]);
                    connection.query(sql, logQueryError);
                });

                ratio = 100 / h;
                pw = w * ratio;
                ph = h * ratio;
                image.resize(pw, ph).getBuffer(jimp.MIME_JPEG, function (err, resizedBuffer) {
                    var sql = 'update tucha.photos set photo_h100=? where id=' + id;
                    sql = mysql.format(sql, [resizedBuffer]);
                    connection.query(sql, logQueryError);
                });

                if (w > h) {
                    ratio = 50 / w;
                } else {
                    ratio = 50 / h;
                }
                pw = w * ratio;
                ph = h * ratio;
                image.resize(pw, ph).getBuffer(jimp.MIME_JPEG, function (err, resizedBuffer) {
                    var sql = 'update tucha.photos set photo_wh50=? where id=' + id;
                    sql = mysql.format(sql, [resizedBuffer]);
                    connection.query(sql, logQueryError);

                    connection.query(sql, function (err) {
                        logQueryError(err);
                        if (typeof callback !== 'undefined') {
                            callback();
                        }
                    });
                });
            });
        });
    });
}

function saveState(state) {
    if (state.deleted) {
        connection.query('update tucha.state set is_deleted=true where position=' + state.position +
            ' and animal=' + state.animal + ' and is_deleted is null');
    } else {
        connection.query('select * from tucha.state where position=' + state.position + ' and animal=' + state.animal +
            ' and is_deleted is null', function (err, rows) {
            var sql;

            if (err || rows.length === 0) {
                sql = 'insert into tucha.state set ?';
            } else if (rows.length > 0) {
                sql = 'update tucha.state set ? where position=' + state.position + ' and animal=' + state.animal;
            }

            connection.query(sql, state, logQueryError);
        });
    }
}

var selects = {
    animal: {
        entity: 'animal',
        details: 'select id, code, name, species, gender, breed, date_of_birth, size, color,' +
        ' details, is_adoptable, is_adoptable_reason, received_by, received_from, received_date,' +
        ' chip_code, is_sterilizated, sterilization_date, sterilization_by, sterilization_details,' +
        ' current_situation, missing_details, death_date, death_reason' +
        ' from tucha.animal where is_deleted is null',
        grid: 'select a.id, a.code, a.name, a.species, a.gender, a.breed, a.date_of_birth, a.size, a.color,' +
        ' a.details, a.is_adoptable, a.is_adoptable_reason, p1.name as received_by, p2.name as received_from, a.received_date,' +
        ' a.chip_code, a.is_sterilizated, a.sterilization_date, v.name as sterilization_by, a.sterilization_details,' +
        ' a.current_situation, a.missing_details, a.death_date, a.death_reason' +
        ' from tucha.animal a ' +
        ' left join tucha.person p1 on p1.id = a.received_by' +
        ' left join tucha.person p2 on p2.id = a.received_from' +
        ' left join tucha.veterinary v on v.id = a.sterilization_by' +
        ' where a.is_deleted is null',
        dropdown: 'select id, name from tucha.animal where is_deleted is null',
        adoptableAnimals: 'select id,name,gender from tucha.animal where is_adoptable=true and ' +
        '(current_situation="IN_SHELTER" or current_situation="FAT" or current_situation="FAR") and ' +
        'is_deleted is null',
        sequence: 'select a.id from tucha.animal a where a.is_deleted is null'
    },
    veterinary: {
        entity: 'veterinary',
        details: 'select id, name, address, details from tucha.veterinary where is_deleted is null',
        dropdown: 'select id, name from tucha.veterinary where is_deleted is null'
    },
    person: {
        entity: 'person',
        details: 'select id, name, address, city, phone, email, volunteer, associate, last_paid_fee, new_adoption_allowed,' +
        ' details, can_host, host_capacity, host_species, host_details from tucha.person where is_deleted is null',
        dropdown: 'select id, name from tucha.person where is_deleted is null'
    },
    volunteer: {
        entity: 'volunteer',
        details: 'select id, name, address, city, phone, email, associate, last_paid_fee, new_adoption_allowed,' +
        ' details, can_host, host_capacity, host_species, host_details from tucha.person where volunteer=true and is_deleted is null',
    },
    associate: {
        entity: 'associate',
        details: 'select id, name, address, city, phone, email, volunteer, last_paid_fee, new_adoption_allowed,' +
        ' details, can_host, host_capacity, host_species, host_details from tucha.person where associate=true and is_deleted is null',
    },
    can_host: {
        entity: 'host',
        details: 'select id, name, address, city, phone, email, volunteer, last_paid_fee, new_adoption_allowed,' +
        ' details, host_capacity, host_species, host_details from tucha.person where can_host=true and is_deleted is null',
    },
    user: {
        entity: 'user',
        details: 'select username, role, person from tucha.user where is_deleted is null',
        grid: 'select u.username, u.role, p.name as person from tucha.user u' +
        ' left join tucha.person p on p.id = u.person where u.is_deleted is null'
    },
    medicalExam: {
        entity: 'medical_exam',
        details: 'select id, animal, date, veterinary, details from tucha.medical_exam where is_deleted is null',
        grid: 'select m.id, a.name as animal, m.date, v.name as veterinary, m.details from tucha.medical_exam m' +
        ' left join tucha.animal a on a.id = m.animal' +
        ' left join tucha.veterinary v on v.id = m.veterinary where m.is_deleted is null'
    },
    vaccination: {
        entity: 'vaccination',
        details: 'select id, animal, date, veterinary, details from tucha.vaccination where is_deleted is null',
        grid: 'select va.id, a.name as animal, va.date, ve.name as veterinary, va.details from tucha.vaccination va' +
        ' left join tucha.animal a on a.id = va.animal' +
        ' left join tucha.veterinary ve on ve.id = va.veterinary where va.is_deleted is null'
    },
    deparasitation: {
        entity: 'deparasitation',
        details: 'select id, animal, date, veterinary, details from tucha.deparasitation where is_deleted is null',
        grid: 'select d.id, a.name as animal, d.date, v.name as veterinary, d.details from tucha.deparasitation d' +
        ' left join tucha.animal a on a.id = d.animal' +
        ' left join tucha.veterinary v on v.id = d.veterinary where d.is_deleted is null'
    },
    medicalTreatment: {
        entity: 'medical_treatment',
        details: 'select id, animal, date, veterinary, details from tucha.medical_treatment where is_deleted is null',
        grid: 'select m.id, a.name as animal, m.date, v.name as veterinary, m.details from tucha.medical_treatment m' +
        ' left join tucha.animal a on a.id = m.animal' +
        ' left join tucha.veterinary v on v.id = m.veterinary where m.is_deleted is null'
    },
    medicamentPrescription: {
        entity: 'medicament_prescription',
        details: 'select id, animal, date, veterinary, details from tucha.medicament_prescription where is_deleted is null',
        grid: 'select m.id, a.name as animal, m.date, v.name as veterinary, m.details from tucha.medicament_prescription m' +
        ' left join tucha.animal a on a.id = m.animal' +
        ' left join tucha.veterinary v on v.id = m.veterinary where m.is_deleted is null',
        dropdown: 'select id, details as name from tucha.medicament_prescription where is_deleted is null'
    },
    aggressivityReport: {
        entity: 'aggressivity_report',
        details: 'select id, animal, date, reported_by, details from tucha.aggressivity_report where is_deleted is null',
        grid: 'select ag.id, an.name as animal, ag.date, p.name as reported_by, ag.details' +
        ' from tucha.aggressivity_report ag' +
        ' left join tucha.animal an on an.id = ag.animal' +
        ' left join tucha.person p on p.id = ag.reported_by where ag.is_deleted is null'
    },
    escapeReport: {
        entity: 'escape_report',
        details: 'select id, animal, date, details, returned_date from tucha.escape_report where is_deleted is null',
        grid: 'select e.id, a.name as animal, e.date, e.details, e.returned_date from tucha.escape_report e' +
        ' left join tucha.animal a on a.id = e.animal where e.is_deleted is null'
    },
    adoption: {
        entity: 'adoption',
        details: 'select id, animal, date, details, adoptant from tucha.adoption where is_deleted is null',
        grid: 'select ad.id, an.name as animal, ad.date, ad.details, p.name as adoptant from tucha.adoption ad' +
        ' left join tucha.animal an on an.id = ad.animal' +
        ' left join tucha.person p on p.id = ad.adoptant' +
        ' where ad.is_deleted is null'
    },
    medicament: {
        entity: 'medicament',
        details: 'select id, name, details from tucha.medicament where is_deleted is null',
        dropdown: 'select id, name from tucha.medicament where is_deleted is null'
    },
    supplier: {
        entity: 'supplier',
        details: 'select id, name, address, phone, email, details from tucha.supplier where is_deleted is null',
        dropdown: 'select id, name from tucha.supplier where is_deleted is null'
    },
    donation: {
        entity: 'donation',
        details: 'select id, details, donated_by from tucha.donation where is_deleted is null',
        grid: 'select d.id, d.details, p.name as donated_by from tucha.donation d' +
        ' left join tucha.person p on p.id = d.donated_by where d.is_deleted is null'
    },
    medicamentUnit: {
        entity: 'medicament_unit ',
        details: 'select id, medicament, details, used, opening_date, expiration_date, bought_in, ' +
        'bought_by, donated_by, acquired_date, unitary_price, initial_quantity, remaining_quantity ' +
        'from tucha.medicament_unit where is_deleted is null',
        grid: 'select mu.id, me.name as medicament, mu.details, mu.used, mu.opening_date,' +
        ' mu.expiration_date, s.name as bought_in, p1.name as bought_by, p2.name as donated_by, mu.acquired_date,' +
        ' mu.unitary_price, mu.initial_quantity, mu.remaining_quantity' +
        ' from tucha.medicament_unit mu' +
        ' left join tucha.medicament me on me.id = mu.medicament' +
        ' left join tucha.supplier s on s.id = mu.bought_in' +
        ' left join tucha.person p1 on p1.id = mu.bought_by' +
        ' left join tucha.person p2 on p2.id = mu.donated_by' +
        ' where mu.is_deleted is null'
    },
    devolution: {
        entity: 'devolution',
        details: 'select id, animal, adoptant, reason, date from tucha.devolution where is_deleted is null',
        grid: 'select d.id, a.name as animal, p.name as adoptant, d.reason, d.date from tucha.devolution d' +
        ' left join tucha.person p on p.id = d.adoptant' +
        ' left join tucha.animal a on a.id = d.animal where d.is_deleted is null'
    },
    medicamentUsed: {
        entity: 'medicament_used',
        details: 'select id, medicament, animal, administrator, prescription, date, quantity ' +
        'from tucha.medicament_used where is_deleted is null',
        grid: 'select mu.id, me.name as medicament, a.name as animal, p.name as administrator,' +
        ' mp.details as prescription, mu.date, mu.quantity' +
        ' from tucha.medicament_used mu' +
        ' left join tucha.medicament me on me.id = mu.medicament' +
        ' left join tucha.animal a on a.id = mu.animal' +
        ' left join tucha.person p on p.id = mu.administrator' +
        ' left join tucha.medicament_prescription mp on mp.id = mu.prescription' +
        ' where mu.is_deleted is null'
    },
    medicamentSupplier: {
        entity: 'medicament_supplier',
        details: 'select supplier, medicament from tucha.medicament_supplier where is_deleted is null',
        grid: 'select s.name as supplier, me.name as medicament from tucha.medicament_supplier ms' +
        ' left join tucha.supplier s on s.id = ms.supplier' +
        ' left join tucha.medicament me on me.id = ms.medicament' +
        ' where ms.is_deleted is null'
    },
    host: {
        entity: 'host',
        details: 'select id, animal, person, start_date, end_date, details from tucha.host where is_deleted is null',
        grid: 'select h.id, a.name as animal, p.name as person, h.start_date, h.end_date, h.details' +
        ' from tucha.host h' +
        ' left join tucha.animal a on a.id = h.animal' +
        ' left join tucha.person p on p.id = h.person' +
        ' where h.is_deleted is null'
    },
    state: {
        entity: 'state',
        details: 'select id, animal, date, details, position from tucha.state where is_deleted is null',
        grid: 'select s.id, a.name as animal, s.date, s.details, s.position from tucha.state s' +
        ' left join tucha.animal a on a.id = s.animal where s.is_deleted is null'
    }
};

// data for slider
app.get('/r/adoptableAnimals', function (req, res) { // used in the slider, must no check authentication
    query(selects.animal.adoptableAnimals, res, true);
});

// get grid
app.get('/r/:entity', auth, function (req, res) {
    query(selects[req.params.entity].grid || selects[req.params.entity].details, res);
});

// get dropdown data
app.get('/r/dropdown/:entity', auth, function (req, res) {
    query(selects[req.params.entity].dropdown, res);
});

// get animals id sequence for the next and previous button
app.get('/r/animal/sequence', function (req, res) {
    console.log(selects.animal.sequence);
    connection.query(selects.animal.sequence, function (err, rows) {
        if (err) {
            console.log(err);
            return;
        }
        var ids = [];
        for (var i = 0; i < rows.length; i++) {
            ids.push(rows[i].id);
        }
        res.json(ids);
    });
});

// get animal details, no auth used to work in deck list
app.get('/r/animal/:id', function (req, res) {
    var sql = selects.animal.details + ' and id=' + mysql.escape(req.params.id);
    console.log(sql);
    connection.query(sql, function (err, rows) {
        if (err) {
            console.log(err);
            return;
        }
        res.json(rows[0]);
    });
});

// get details
app.get('/r/:entity/:id', auth, function (req, res) {
    var sql = selects[req.params.entity].details + ' and id=' + mysql.escape(req.params.id);
    console.log(sql);
    connection.query(sql, function (err, rows) {
        if (err) {
            console.log(err);
            return;
        }
        res.json(rows[0]);
    });
});

// save details
app.post('/r/:entity/:id', auth, function (req, res) {
    var sql, entity = selects[req.params.entity].entity, data = req.body, states = null;

    if (entity === 'volunteer' || entity === 'associate') {
        entity = 'person';
    }

    if (req.params.id === 'new') {
        sql = 'insert into tucha.' + entity + ' set ?';
    } else {
        sql = 'update tucha.' + entity + ' set ? where id=' + mysql.escape(req.params.id);
    }

    if (entity === 'animal') {
        states = data.states;
        delete data.states;
    }

    console.log(sql, data);
    connection.query(sql, data, function (err, result) {
        if (err) {
            console.log(err);
            return;
        }

        var id = req.params.id === 'new' ? result.insertId : req.params.id;

        if (entity === 'animal') {
            for (var i = 0; i < states.length; i++) {
                states[i].animal = id;
                saveState(states[i]);
            }
        }
        res.end(id + '');
    });
});

// save details
app.delete('/r/:entity/:id', auth, function (req, res) {
    query('update tucha.' + selects[req.params.entity].entity + ' set is_deleted=true where id=' + mysql.escape(req.params.id), res);
});

var emptyImage = new Buffer('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64'); // 1px gif

function getPhoto(req, res, column) {
    connection.query('select ' + column + ' from tucha.photos where id=' + req.params.id, function (err, rows) {
        if (err || rows.length === 0 || rows[0][column] === null) {
            res.writeHead(200, {'Content-Type': 'image/gif'});
            res.end(emptyImage);
        } else if (rows.length > 0) {
            res.writeHead(200, {'Content-Type': 'image/jpeg'});
            res.end(rows[0][column], 'binary');
        }
    });
}

// used after clicking the deck popup image. could be removed when space is an issue
app.get(['/r/animal/:id/photo', '/r/animal/:id/photo.jpeg'], function (req, res) {
    getPhoto(req, res, 'photo');
});

// main slider, details, deck popup
app.get('/r/animal/:id/photo_h500', function (req, res) {
    getPhoto(req, res, 'photo_h500');
});

// deck cards
app.get('/r/animal/:id/photo_w250', function (req, res) {
    getPhoto(req, res, 'photo_w250');
});

// secondary slider
app.get('/r/animal/:id/photo_h100', function (req, res) {
    getPhoto(req, res, 'photo_h100');
});

// grid thumbnails
app.get('/r/animal/:id/photo_wh50', function (req, res) {
    getPhoto(req, res, 'photo_wh50');
});

app.post('/r/animal/:id/photo', auth, function (req, res) {
    // store uploaded image
    if (typeof req.files.file !== 'undefined') { // image upload
        storeImage(req.params.id, req.files.file.buffer, function () {
            res.end();
        });
    } else {
        res.end();
    }
});

app.get('/r/animal/:id/states', auth, function (req, res) {
    query('select date, details, position from tucha.state where animal=' + req.params.id + ' and is_deleted is null' +
        ' order by position asc', res);
});

app.post('/r/changePassword', auth, function (req, res) {
    query('update tucha.user set password_hash=\'' + bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(8), null) +
        '\' where username=' + mysql.escape(req.user.username), res);
});

app.listen(config.nodePort, config.nodeIp);


// function dbV1toV2convertion() {
//     var i = 1;
//     var intervalId = setInterval(function () {
//         console.log(i);
//         connection.query('select id, picture from tucha.animal where id=' + i, function (err, rows) {
//             if (rows[0].picture !== null) {
//                 storeImage(rows[0].id, rows[0].picture);
//             }
//         });
//         i++;
//         if (i === 394) {
//             clearInterval(intervalId);
//         }
//     }, 60000);
// }
// dbV1toV2convertion();
