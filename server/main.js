#!/usr/bin/env node

'use strict';

var express = require('express');
var bodyParser = require('body-parser');

var app = express();
var urlencodedParser = bodyParser.urlencoded({
    extended: false
});

var mysql = require('mysql');

// var connection = mysql.createConnection({
//     host: process.env.OPENSHIFT_MYSQL_DB_HOST,
//     port: process.env.OPENSHIFT_MYSQL_DB_PORT,
//     user: 'user',
//     password: 'password'
// });

var connection = mysql.createConnection({
    host: '127.0.0.1',
    port: '3306',
    user: 'root',
    password: 'mysql'
});

connection.connect();

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

app.post('/r/animal/:id', urlencodedParser, function (req, res) {
    var sql, keys;
    if (req.params.id === 'new') {
        sql = 'insert into tucha.animal (';
        keys = Object.keys(req.body);

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
                throw err;
            }
            res.redirect('/#/animals');
        });
    } else {
        sql = 'update tucha.animal set ';
        keys = Object.keys(req.body);

        for (var i = 0; i < keys.length - 1; i++) {
            sql += keys[i] + '=' + mysql.escape(req.body[keys[i]]) + ', ';
        }
        sql += keys[keys.length - 1] + '=' + mysql.escape(req.body[keys[keys.length - 1]]) + ' where id=' + mysql.escape(req.params.id);
        console.log(sql);
        connection.query(sql, function (err, rows) {
            if (err) {
                throw err;
            }
            res.redirect('/#/animals');
        });
    }
});

// app.listen(process.env.OPENSHIFT_NODEJS_PORT, process.env.OPENSHIFT_NODEJS_IP);

app.listen(3000);

// connection.end();
