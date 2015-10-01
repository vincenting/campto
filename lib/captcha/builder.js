/**
 * Created by vt on 15/9/30.
 */

'use strict';

var _ = require('underscore');
var async = require('async');
var fs = require('fs');
var gm = require('gm');
var path = require('path');
var temp = require('temp');
var uuid = require('node-uuid');

var CAMPTO_ASSETS_PATH = path.join(__dirname, '../assets');
var Topic = require('./topic');

temp.track(true);

var CaptchaBuilder = module.exports = function () {
    //TODO: 这里考虑后期允许用户自定义 backgroundImagePath
    var topic = Topic.rand();
    this._subject = topic.subject;
    this.result = topic.result;
};

CaptchaBuilder.toBuffer = function (callback) {
    var c = new CaptchaBuilder();
    c.draw(function (err, canvas) {
        if (err) {
            c.done();
            return callback(err);
        }
        canvas.toBuffer('PNG', function (err, buffer) {
            c.done();
            if (err) {
                return callback(err);
            }
            callback(null, buffer, c.result);
        })
    });
};

CaptchaBuilder.toFile = function (filePath, callback) {
    var c = new CaptchaBuilder();
    c.draw(function (err, canvas) {
        if (err) {
            c.done();
            return callback(err);
        }
        canvas.write(filePath, function (err) {
            c.done();
            if (err) {
                return callback(err);
            }
            callback(null, c.result);
        })
    });
};

CaptchaBuilder.prototype.draw = function (callback) {
    callback = callback || _.noop;
    async.map(this._subject.split(' '), CaptchaBuilder.createTempWordFile, function (err, tempFiles) {
        if (err) return callback(err, null);
        // 将所有临时单个字母的图片拼凑成一张临时图片
        var tempCaptcha = gm(tempFiles.shift());
        tempCaptcha.append.apply(tempCaptcha, tempFiles).append(true)
            .toBuffer("PNG", function (err, buffer) {
                if (err) return callback(err, null);
                temp.open(uuid.v4(), function (err, info) {
                    if (err) return callback(err, null);
                    fs.writeFile(info.path, buffer, function (err) {
                        if (err) return callback(err);
                        callback(false, gm(path.join(CAMPTO_ASSETS_PATH, 'image', 'bg.gif'))
                            .composite(info.path).geometry('+10+0'));
                    });
                });
            });
    });
};

CaptchaBuilder.prototype.done = function () {
    temp.cleanupSync();
};

CaptchaBuilder.createTempWordFile = function (word, callback) {
    // 将每个内容快生产 32 像素大小随机字体随机颜色随机倾斜的临时图片
    gm(33, 50, 'transparent')
        .fontSize(32)
        .fill(CaptchaBuilder._randColor())
        .font(CaptchaBuilder._randFont())
        .drawText(0, 0, word, 'Center')
        .rotate('transparent', _.sample([1, -1]) * parseInt(Math.random() * 15, 10))
        .toBuffer("PNG", function (err, buffer) {
            if (err) return callback(err, null);
            temp.open(uuid.v4(), function (err, info) {
                if (err) return callback(err, null);
                fs.writeFile(info.path, buffer, function (err) {
                    if (err) return callback(err, null);
                    callback(null, info.path);
                });
            });
        });
};

CaptchaBuilder._randFont = (function () {
    var fontsArr = [];
    _(6).times(function (n) {
        fontsArr.push(path.join(CAMPTO_ASSETS_PATH, 'font', './0' + (n + 1) + '.ttf'));
    });
    //TODO: 这里考虑后期允许用户自定义 fontsArr
    return function () {
        return _.sample(fontsArr);
    }
})();

CaptchaBuilder._randColor = function () {
    //TODO: 这里考虑后期允许用户自定义 colors
    var colors = ['#000000', '#b50000', '#373000', '#827482'];
    return _.sample(colors);
};