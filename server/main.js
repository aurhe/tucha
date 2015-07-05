#!/usr/bin/env node

'use strict';

var dropbox = require('dropbox');
var mysql = require('mysql');

// replace dropbox and mysql credentials here
var client = new dropbox.Client({
    key: 'key',
    secret: 'secret',
    token: 'token'
});
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

app.use(multer({inMemory: true}));

//html
app.use(express.static('public'));

//rest
app.get('/r/animals', function (req, res) {
    console.log('select * from tucha.animal');
    connection.query('select * from tucha.animal', function (err, rows) {
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
    client.readdir(req.params.id + '', function (error, entries) {
        if (error || entries.length === 0) {
            res.writeHead(200, {'Content-Type': 'image/gif'});
            res.end(emptyImage);
        } else if (entries.length > 0) {
            client.readFile(req.params.id + '/' + entries[0], {binary: true}, function (error, data, stat) {
                if (error) {
                    console.log(error);
                }
                console.log('Sending file ' + entries[0]);
                res.writeHead(200, {'Content-Type': stat.mimeType});
                res.end(data, 'binary');
            });
        }
    });
});

app.post('/r/animal/:id', urlencodedParser, function (req, res) {
    var sql, keys = Object.keys(req.body);

    console.log(req.body);

    //var picture = req.body.picture;
    //keys.splice(keys.indexOf('picture'), 1); // do not try to insert it into the db

    if (req.params.id === 'new') {
        sql = 'insert into tucha.animal (';

        for (var i = 0; i < keys.length - 1; i++) {
            sql += keys[i] + ', '
        }
        sql += keys[keys.length - 1] + ') values (';
        for (var i = 0; i < keys.length - 1; i++) {
            sql += mysql.escape(req.body[keys[i]]) + ', '
        }
        sql += mysql.escape(req.body[keys[keys.length - 1]]) + ')';
        console.log(sql);
        connection.query(sql, function (err, rows) {
            if (err) {
                console.log(err);
            }

            client.mkdir(rows.insertId + '');

            if (typeof req.files.picture !== 'undefined') { // image upload
                client.writeFile(rows.insertId + '/' + req.files.picture.originalname, req.files.picture.buffer, function (error, stat) {
                    if (error) {
                        console.log(error);
                    }
                    console.log('Dropbox file saved: ' + rows.insertId + '/' + req.files.picture.originalname);
                });
            }

            res.redirect('/#/animals');
        });
    } else {
        sql = 'update tucha.animal set ';

        for (var i = 0; i < keys.length - 1; i++) {
            sql += keys[i] + '=' + mysql.escape(req.body[keys[i]]) + ', ';
        }
        sql += keys[keys.length - 1] + '=' + mysql.escape(req.body[keys[keys.length - 1]]) + ' where id=' + mysql.escape(req.params.id);
        console.log(sql);
        connection.query(sql, function (err, rows) {
            if (err) {
                console.log(err);
            }
            res.redirect('/#/animals');
        });

        if (typeof req.files.picture !== 'undefined') { // image upload
            client.writeFile(req.params.id + '/' + req.files.picture.originalname, req.files.picture.buffer, function (error, stat) {
                if (error) {
                    console.log(error);
                }
                console.log('Dropbox file saved: ' + req.params.id + '/' + req.files.picture.originalname);
            });
        }
    }
});

// app.listen(process.env.OPENSHIFT_NODEJS_PORT, process.env.OPENSHIFT_NODEJS_IP);

app.listen(3000);

// connection.end();
