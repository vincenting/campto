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

var CAMPTO_ASSETS_PATH = path.join(__dirname, '../../assets');
var Topic = require('./topic');

temp.track(true);

var CaptchaBuilder = module.exports = function () {
    //TODO: 这里考虑后期允许用户自定义 backgroundImagePath
    var topic = Topic.rand();
    // 预留熟悉给测试使用，确保每次处理完后缓存文件都会被清空
    this._debug_error_assert = false;
    this._done_for_debug = false;
    this._subject = topic.subject;
    this.result = topic.result;
};

CaptchaBuilder.toBuffer = function (callback, _error_assert) {
    var c = new CaptchaBuilder();
    c._debug_error_assert = _error_assert;
    c.draw(function (err, canvas) {
        if (err) {
            c.done();
            return callback.call(c, err);
        }
        canvas.toBuffer(function (err, buffer) {
            c.done();
            if (err || ((err = c._debug_error_assert) === 'TO_BUFFER_WRITE_ERROR')) {
                return callback.call(c, err);
            }
            callback.call(c, null, buffer, c.result);
        })
    });
};

CaptchaBuilder.toFile = function (filePath, callback, _error_assert) {
    var c = new CaptchaBuilder();
    c._debug_error_assert = _error_assert;
    c.draw(function (err, canvas) {
        if (err) {
            c.done();
            return callback.call(c, err);
        }
        canvas.write(filePath, function (err) {
            c.done();
            if (err || ((err = c._debug_error_assert) === 'TO_FILE_WRITE_ERROR')) {
                return callback.call(c, err);
            }
            callback.call(c, null, c.result);
        })
    });
};

CaptchaBuilder.prototype.draw = function (callback) {
    var self = this;
    async.map(this._subject.split(' '), self.createTempWordFile.bind(self), function (err, tempFiles) {
        if (err) return callback(err, null);
        // 将所有临时单个字母的图片拼凑成一张临时图片
        var tempCaptcha = gm(tempFiles.shift());
        tempCaptcha.append.apply(tempCaptcha, tempFiles).append(true)
            .setFormat('png')
            .toBuffer(function (err, buffer) {
                if (err || ((err = self._debug_error_assert) === 'DRAW_TO_BUFFER_ERROR')) return callback(err, null);
                temp.open(uuid.v4(), function (err, info) {
                    if (err || ((err = self._debug_error_assert) === 'DRAW_TEMP_FILE_CREATE_ERROR')) return callback(err, null);
                    fs.writeFile(info.path, buffer, function (err) {
                        if (err || ((err = self._debug_error_assert) === 'DRAW_TEMP_FILE_WRITE_ERROR')) return callback(err, null);
                        callback(false, gm(path.join(CAMPTO_ASSETS_PATH, 'image', 'bg.gif'))
                            .composite(info.path).geometry('+10+0').setFormat('png'));
                    });
                });
            });
    });
};

CaptchaBuilder.prototype.done = function () {
    this._done_for_debug = true;
    temp.cleanupSync();
};

CaptchaBuilder.prototype.createTempWordFile = function (word, callback) {
    var self = this;
    // 将每个内容快生产 32 像素大小随机字体随机颜色随机倾斜的临时图片
    gm(33, 50, 'transparent')
        .fontSize(32)
        .fill(self._randColor())
        .font(self._randFont())
        .drawText(0, 0, word, 'Center')
        .rotate('transparent', _.sample([1, -1]) * parseInt(Math.random() * 15, 10))
        .setFormat('png')
        .toBuffer(function (err, buffer) {
            if (err || ((err = self._debug_error_assert) === 'WORD_TO_BUFFER_ERROR')) return callback(err, null);
            temp.open(uuid.v4(), function (err, info) {
                if (err || ((err = self._debug_error_assert) === 'WORD_TEMP_FILE_CREATE_ERROR')) return callback(err, null);
                fs.writeFile(info.path, buffer, function (err) {
                    if (err || ((err = self._debug_error_assert) === 'WORD_TEMP_FILE_WRITE_ERROR')) return callback(err, null);
                    callback(null, info.path);
                });
            });
        });
};

CaptchaBuilder.prototype._randFont = (function () {
    var fontsArr = [];
    _(6).times(function (n) {
        fontsArr.push(path.join(CAMPTO_ASSETS_PATH, 'font', './0' + (n + 1) + '.ttf'));
    });
    //TODO: 这里考虑后期允许用户自定义 fontsArr
    return function () {
        return _.sample(fontsArr);
    }
})();

CaptchaBuilder.prototype._randColor = function () {
    //TODO: 这里考虑后期允许用户自定义 colors
    var colors = ['#000000', '#b50000', '#373000', '#827482'];
    return _.sample(colors);
};