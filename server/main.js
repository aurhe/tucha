#!/usr/bin/env node

'use strict';

//var dropbox = require('dropbox');
var mysql = require('mysql');
var jimp = require('jimp');

var connection = mysql.createConnection({
    host: '127.0.0.1',
    port: '3306',
    user: 'root',
    password: 'mysql'
});

connection.connect();

var express = require('express');

var app = express();
//var urlencodedParser = bodyParser.urlencoded({
//    extended: false
//});
var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

var multer = require('multer'); // parse file uploads
app.use(multer({
    inMemory: true,
    includeEmptyFields: true
}));

function logQueryError(err) {
    if (err) {
        console.log(err);
    }
}

//html
app.use(express.static('public'));

//rest

function storeImage(id, buffer, callback) {
    new jimp(buffer, function (err, image) {
        var w = image.bitmap.width,
            h = image.bitmap.height,
            pictureRatio = 800 / w,
            pw = w * pictureRatio,
            ph = h * pictureRatio,
            thumbnailRatio = 50 / w,
            tw = w * thumbnailRatio,
            th = h * thumbnailRatio;

        image.resize(pw, ph)
            .getBuffer(jimp.MIME_JPEG, function (err, resizedBuffer) {
                var sql = 'update tucha.animal set picture=? where id=' + id;
                sql = mysql.format(sql, [resizedBuffer]);

                connection.query(sql, logQueryError);
            });

        image.resize(tw, th)
            .getBuffer(jimp.MIME_JPEG, function (err, resizedBuffer) {
                var sql = 'update tucha.animal set picture_thumbnail=? where id=' + id;
                sql = mysql.format(sql, [resizedBuffer]);

                connection.query(sql, function (err) {
                    logQueryError(err);
                    if (typeof callback !== 'undefined') {
                        callback();
                    }
                });
            });
    });
}

function saveState(state) {
    connection.query('select * from tucha.state where position=' + state.position + ' and animal=' + state.animal,
        function (err, rows) {
            var sql;

            if (err || rows.length === 0) {
                sql = 'insert into tucha.state set ?';
            } else if (rows.length > 0) {
                sql = 'update tucha.state set ? where position=' + state.position + ' and animal=' + state.animal;
            }

            connection.query(sql, state, logQueryError);
        });
}

app.get('/r/adoptableAnimals', function (req, res) { // used in the slider
    var sql = 'select id,name,gender from tucha.animal where is_adoptable=true and ' +
        '(current_situation="IN_SHELTER" or current_situation="FAT" or current_situation="FAR") and ' +
        'picture_thumbnail is not null and is_deleted is null';
    console.log(sql);
    connection.query(sql, function (err, rows) {
        logQueryError(err);
        res.json(rows);
    });
});

var selects = {
    animal: 'select id, code, name, species, gender, breed, date_of_birth, size, color,' +
    ' details, is_adoptable, is_adoptable_reason, received_by, received_from, received_date,' +
    ' received_details, chip_code, is_sterilizated, sterilization_date, sterilization_by, sterilization_details,' +
    ' current_situation, missing_details, death_date, death_reason' +
    ' from tucha.animal where is_deleted is null',
    veterinary: 'select id, name, address, details from tucha.veterinary where is_deleted is null',
    person: 'select id, name, address, city, phone, email, new_adoption_allowed, details, can_host, host_capacity, ' +
    'host_species, host_details from tucha.person where is_deleted is null',
    user: 'select username, role, person from tucha.user where is_deleted is null',
    medicalExam: 'select id, animal, date, veterinary, details from tucha.medical_exam where is_deleted is null',
    vaccination: 'select id, animal, date, veterinary, details from tucha.vaccination where is_deleted is null',
    deparasitation: 'select id, animal, date, veterinary, details from tucha.deparasitation where is_deleted is null',
    medicalTreatment: 'select id, animal, date, veterinary, details from tucha.medical_treatment where is_deleted is null',
    medicamentPrescription: 'select id, animal, date, veterinary, details from tucha.medicament_prescription where is_deleted is null',
    aggressivityReport: 'select id, animal, date, reported_by, details from tucha.aggressivity_report where is_deleted is null',
    escapeReport: 'select id, animal, date, details, returned_date from tucha.escape_report where is_deleted is null',
    adoption: 'select id, animal, date, details, adoptant from tucha.adoption where is_deleted is null',
    medicament: 'select id, name, details from tucha.medicament where is_deleted is null',
    supplier: 'select id, name, address, phone, email, details from tucha.supplier where is_deleted is null',
    donation: 'select id, details, donated_by from tucha.donation where is_deleted is null',
    medicamentUnit: 'select id, medicament, details, used, used_in, opening_date, expiration_date, bought_in, ' +
    'bought_by, donated_by, acquired_date, unitary_price, initial_quantity, remaining_quantity ' +
    'from tucha.medicament_unit where is_deleted is null',
    devolution: 'select id, animal, adoptant, reason, date from tucha.devolution where is_deleted is null',
    medicamentUsed: 'select id, medicament, animal, administrator, prescription, date, quantity ' +
    'from tucha.medicament_used where is_deleted is null',
    medicamentSupplier: 'select supplier, medicament from tucha.medicament_supplier where is_deleted is null',
    volunteer: 'select id, person, disponibility, activities, expertises, connections ' +
    'from tucha.volunteer where is_deleted is null',
    host: 'select id, animal, person, start_date, end_date, details from tucha.host where is_deleted is null',
    state: 'select id, animal, date, details, position from tucha.host where is_deleted is null'
};

// get grid
app.get('/r/:entity', function (req, res) {
    var sql = selects[req.params.entity];
    console.log(sql);
    connection.query(sql, function (err, rows) {
        logQueryError(err);
        console.log(rows);
        res.json(rows);
    });
});

// get details
app.get('/r/:entity/:id', function (req, res) {
    //var sql = 'select * from tucha.' + req.params.entity + ' where id=' + mysql.escape(req.params.id);
    var sql = selects[req.params.entity] + ' and id=' + mysql.escape(req.params.id);
    console.log(sql);
    connection.query(sql, function (err, rows) {
        logQueryError(err);
        console.log(rows[0]);
        res.json(rows[0]);
    });
});

// save details
app.post('/r/:entity/:id', function (req, res) {
    var sql, entity = req.params.entity, data = req.body, states = null;

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
app.delete('/r/:entity/:id', function (req, res) {
    var sql = 'update tucha.' + req.params.entity + ' set is_deleted=true where id=' + mysql.escape(req.params.id);
    console.log(sql);
    connection.query(sql, function (err) {
        logQueryError(err);
        res.end();
    });
});

var emptyImage = new Buffer('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64'); // 1px gif
app.get('/r/animal/:id/picture', function (req, res) {
    connection.query('select picture from tucha.animal where id=' + req.params.id, function (err, rows) {
        if (err || rows.length === 0 || rows[0].picture === null) {
            res.writeHead(200, {'Content-Type': 'image/gif'});
            res.end(emptyImage);
        } else if (rows.length > 0) {
            res.writeHead(200, {'Content-Type': 'image/jpeg'});
            res.end(rows[0].picture, 'binary');
        }
    });
});

app.post('/r/animal/:id/picture', function (req, res) {
    // store uploaded image
    if (typeof req.files.file !== 'undefined') { // image upload
        storeImage(mysql.escape(req.params.id), req.files.file.buffer, function () {
            res.end();
        });
    } else {
        res.end();
    }
});

app.get('/r/animal/:id/thumbnail', function (req, res) {
    connection.query('select picture_thumbnail from tucha.animal where id=' + req.params.id, function (err, rows) {
        if (err || rows.length === 0 || rows[0].picture_thumbnail === null) {
            res.writeHead(200, {'Content-Type': 'image/gif'});
            res.end(emptyImage);
        } else if (rows.length > 0) {
            res.writeHead(200, {'Content-Type': 'image/jpeg'});
            res.end(rows[0].picture_thumbnail, 'binary');
        }
    });
});

app.get('/r/animal/:id/states', function (req, res) {
    connection.query('select date, details, position from tucha.state where animal=' + req.params.id +
        ' order by position asc', function (err, rows) {
        logQueryError(err);
        res.json(rows);
    });
});

// app.listen(process.env.OPENSHIFT_NODEJS_PORT, process.env.OPENSHIFT_NODEJS_IP);

app.listen(3000);

// connection.end();
