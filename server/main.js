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

//html
app.use(express.static('public'));

//rest

app.get('/r/adoptableAnimals', function (req, res) {
    var sql = 'select id,name,gender from tucha.animal where is_adoptable=true and is_dead=false and ' +
        'picture_thumbnail is not null and is_deleted is null';
    console.log(sql);
    connection.query(sql, function (err, rows) {
        res.json(rows);
    });
});

app.get('/r/animals', function (req, res) {
    var sql = 'select id, name, species, gender, breed, year_of_birth, size, color, physical_state, emotional_state,' +
        ' details, is_adoptable, is_adoptable_reason, received_by, received_from, received_date, received_reason,' +
        ' received_details, chip_code, is_sterilizated, sterilization_date, sterilization_by, sterilization_details,' +
        ' is_dead, death_date, death_reason' +
        ' from tucha.animal where is_deleted is null';
    console.log(sql);
    connection.query(sql, function (err, rows) {
        res.json(rows);
    });
});

app.get('/r/animal/:id', urlencodedParser, function (req, res) {
    console.log('select * from tucha.animal where id=' + req.params.id);
    connection.query('select * from tucha.animal where id=' + mysql.escape(req.params.id), function (err, rows) {
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

                connection.query(sql, function (err) {
                    if (err) {
                        console.log(err);
                    }
                });
            });

        image.resize(tw, th)
            .getBuffer(jimp.MIME_JPEG, function (err, resizedBuffer) {
                var sql = 'update tucha.animal set picture_thumbnail=? where id=' + id;
                sql = mysql.format(sql, [resizedBuffer]);

                connection.query(sql, function (err) {
                    if (err) {
                        console.log(err);
                    }
                    if (typeof callback !== 'undefined') {
                        callback();
                    }
                });
            });
    });
}

app.post('/r/animal/:id', urlencodedParser, function (req, res) {
    var i, sql, data = req.body, keys = Object.keys(data);

    if (req.params.id === 'new') {
        sql = 'insert into tucha.animal (';

        for (i = 0; i < keys.length - 1; i++) {
            sql += keys[i] + ', ';
        }
        sql += keys[keys.length - 1] + ') values (';
        for (i = 0; i < keys.length - 1; i++) {
            sql += mysql.escape(data[keys[i]]) + ', ';
        }
        sql += mysql.escape(data[keys[keys.length - 1]]) + ')';
    } else {
        sql = 'update tucha.animal set ';

        for (i = 0; i < keys.length - 1; i++) {
            sql += keys[i] + '=' + mysql.escape(data[keys[i]]) + ', ';
        }
        sql += keys[keys.length - 1] + '=' + mysql.escape(data[keys[keys.length - 1]]) +
            ' where id=' + mysql.escape(req.params.id);
    }

    console.log(sql);
    connection.query(sql, function (err, result) {
        if (err) {
            console.log(err);
        }

        if (typeof req.files.picture !== 'undefined') { // image upload
            storeImage(req.params.id === 'new' ? result.insertId : mysql.escape(req.params.id),
                req.files.picture.buffer, function () {
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
