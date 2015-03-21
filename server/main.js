#!/usr/bin/env node

'use strict';

var express = require('express');
var bodyParser = require('body-parser');

var app = express();
var urlencodedParser = bodyParser.urlencoded({
    extended: false
})

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
    user: 'root'
});

connection.connect();

//html
app.use(express.static('public'));

//rest
app.get('/r/animals', function(req, res) {
    connection.query('select * from tucha.animal', function(err, rows, fields) {
        res.json(rows);
    });
});

app.get('/r/animal/:id', function(req, res) {
    connection.query('select * from tucha.animal where id=' + req.params.id, function(err, rows, fields) {
        res.json(rows[0]);
    });
});

app.post('/r/animal/:id', urlencodedParser, function(req, res) {
    var sql = 'update tucha.animal set ',
        keys = Object.keys(req.body);

    for (var i = keys.length - 1; i > 0; i--) {
        sql += keys[i] + '=\'' + req.body[keys[i]] + '\', ';
    };
    sql += keys[0] + '=\'' + req.body[keys[0]] + '\' where id=' + req.params.id;

    connection.query(sql, function(err, rows, fields) {
        res.redirect('/#/animals');
    });
});

// app.listen(process.env.OPENSHIFT_NODEJS_PORT, process.env.OPENSHIFT_NODEJS_IP);

app.listen(3000);

// connection.end();