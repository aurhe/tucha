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
var bodyParser = require('body-parser'); // parse form data
var multer = require('multer'); // parse file uploads

var app = express();
var urlencodedParser = bodyParser.urlencoded({
    extended: false
});

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

app.get('/r/adoptableAnimals', function (req, res) {
    var sql = 'select id,name,gender from tucha.animal where is_adoptable=true and ' +
        '(current_situation="IN_SHELTER" or current_situation="FAT" or current_situation="FAR") and ' +
        'picture_thumbnail is not null and is_deleted is null';
    console.log(sql);
    connection.query(sql, function (err, rows) {
        logQueryError(err);
        res.json(rows);
    });
});

app.get('/r/animals', function (req, res) {
    var sql = 'select id, name, species, gender, breed, date_of_birth, size, color,' +
        ' details, is_adoptable, is_adoptable_reason, received_by, received_from, received_date,' +
        ' received_details, chip_code, is_sterilizated, sterilization_date, sterilization_by, sterilization_details,' +
        ' current_situation, missing_details, death_date, death_reason' +
        ' from tucha.animal where is_deleted is null';
    console.log(sql);
    connection.query(sql, function (err, rows) {
        logQueryError(err);
        res.json(rows);
    });
});

app.get('/r/animal/:id', urlencodedParser, function (req, res) {
    console.log('select * from tucha.animal where id=' + req.params.id);
    connection.query('select * from tucha.animal where id=' + mysql.escape(req.params.id), function (err, rows) {
        logQueryError(err);
        res.json(rows[0]);
    });
});

var emptyImage = new Buffer('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64'); // 1px gif
app.get('/r/animal/:id/picture', urlencodedParser, function (req, res) {
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

app.get('/r/animal/:id/thumbnail', urlencodedParser, function (req, res) {
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

app.get('/r/animal/:id/states', urlencodedParser, function (req, res) {
    connection.query('select date, details, position from tucha.state where animal=' + req.params.id +
        ' order by position asc', function (err, rows) {
        logQueryError(err);
        res.json(rows);
    });
});

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

app.post('/r/animal/:id', urlencodedParser, function (req, res) {
    var id, sql, data = req.body;

    if (req.params.id === 'new') {
        sql = 'insert into tucha.animal set ?';
    } else {
        sql = 'update tucha.animal set ? where id=' + mysql.escape(req.params.id);
    }

    var keys = Object.keys(data);
    var states = [];

    for (var i = 0; i < keys.length; i++) {
        if (keys[i].indexOf('state_date_') !== -1) {
            id = parseInt(keys[i].substr(11), 10);
            states[id] = {
                date: data['state_date_' + id],
                details: data['state_details_' + id],
                position: id
            };
            delete data['state_date_' + id];
        }
        if (keys[i].indexOf('state_details_') !== -1) {
            id = parseInt(keys[i].substr(14), 10);
            delete data['state_details_' + id];
        }
    }

    connection.query(sql, data, function (err, result) {
        logQueryError(err);

        var id = req.params.id === 'new' ? result.insertId : req.params.id;

        // store image states
        if (states.length > 0) {
            for (var i = 0; i < states.length; i++) {
                states[i].animal = id;
                saveState(states[i]);
            }
        }

        // store uploaded image
        if (typeof req.files.picture !== 'undefined') { // image upload
            storeImage(id, req.files.picture.buffer, function () {
                res.redirect('/#/animals');
            });
        } else {
            res.redirect('/#/animals');
        }
    });
});

// app.listen(process.env.OPENSHIFT_NODEJS_PORT, process.env.OPENSHIFT_NODEJS_IP);

app.listen(3000);

// connection.end();
