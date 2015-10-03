/**
 * Created by vt on 15/10/3.
 */

'use strict';

var express = require('express');
var session = require('express-session');
var path = require('path');
var bodyParser = require('body-parser');
var Captcha = require('../../lib/captcha');

var app = express();

app.use(session({
    secret: 'heloCampto',
    resave: false,
    saveUninitialized: true
}));

app.use(bodyParser.urlencoded({
    extended: true
}));

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, './index.html'));
});

app.get('/captcha', function (req, res) {
    Captcha.toBuffer(function (err, buffer, result) {
        if (err) throw error;
        req.session['captcha'] = result + '';
        res.send(buffer);
    });
});

app.post('/captcha', function (req, res) {
    if (req.body['captcha'] === req.session['captcha']) {
        return res.send('验证码通过');
    }
    res.send('验证码失败！\n' + req.body['captcha'] + ' 不等于 ' + req.session['captcha']);
});

var server = app.listen(3000, function () {
    var host = server.address().address;
    var port = server.address().port;

    console.log('Example app listening at http://%s:%s', host, port);
});