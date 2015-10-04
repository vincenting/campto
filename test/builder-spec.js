/**
 * Created by vt on 15/10/1.
 */

'use strict';

var async = require('async');
var fs = require('fs');
var should = require('should');

var CaptchaBuilder = require('../lib/builder');
var Topic = require('../lib/topic');

describe('test without error', function () {
    var t = Topic.rand();

    it('should callback with result and create file when use toFile', function (done) {
        var tempFileName = './temp.png';
        CaptchaBuilder.toFile(t.subject, tempFileName, function (err) {
            should(err).be.exactly(null);
            should(this._done_for_debug).be.exactly(true);
            fs.stat(tempFileName, function (err) {
                should(err == null).be.exactly(true);
                fs.unlinkSync(tempFileName);
                done();
            });
        });
    });

    it('should callback with result buffer when use toBuffer', function (done) {
        CaptchaBuilder.toBuffer(t.subject, function (err, buffer) {
            should(err).be.exactly(null);
            should(this._done_for_debug).be.exactly(true);
            should(buffer.length > 0).be.exactly(true);
            done();
        });
    });
});

describe('test with all known type error', function () {
    var t = Topic.rand();
    var KNOWN_ERRORS = ['DRAW_TO_BUFFER_ERROR',
        'DRAW_TEMP_FILE_CREATE_ERROR',
        'DRAW_TEMP_FILE_WRITE_ERROR',
        'WORD_TO_BUFFER_ERROR',
        'WORD_TEMP_FILE_CREATE_ERROR',
        'WORD_TEMP_FILE_WRITE_ERROR',
        'DRAW_BACKGROUND_IMG_ERROR'
    ];

    it('should always done whatever error happened when use toFile', function (done) {
        var tempFileName = './temp.png';
        async.map(KNOWN_ERRORS, function (error, callback) {
            CaptchaBuilder.toFile(t.subject, tempFileName, function (err) {
                should(this._done_for_debug).be.exactly(true);
                callback(null, err)
            }, {_error_assert: error});
        }, function (err, result) {
            try {
                fs.unlinkSync(tempFileName);
            } catch (_) {

            }
            should(err).be.exactly(null);
            result.should.eql(KNOWN_ERRORS);
            done();
        });
    });

    it('should always done whatever error happened when use toBuffer', function (done) {
        async.map(KNOWN_ERRORS, function (error, callback) {
            CaptchaBuilder.toBuffer(t.subject, function (err) {
                should(this._done_for_debug).be.exactly(true);
                callback(null, err)
            }, {_error_assert: error});
        }, function (err, result) {
            should(err).be.exactly(null);
            result.should.eql(KNOWN_ERRORS);
            done();
        });
    });

    it('should pass error error happened in toFile', function (done) {
        var tempFileName = './temp.png';
        CaptchaBuilder.toFile(t.subject, tempFileName, function (err) {
            should(this._done_for_debug).be.exactly(true);
            err.should.equal('TO_FILE_WRITE_ERROR');
            try {
                fs.unlinkSync(tempFileName);
            } catch (_) {

            }
            done();
        }, {_error_assert: 'TO_FILE_WRITE_ERROR'});
    });

    it('should pass error error happened in toBuffer', function (done) {
        CaptchaBuilder.toBuffer(t.subject, function (err) {
            should(this._done_for_debug).be.exactly(true);
            err.should.equal('TO_BUFFER_WRITE_ERROR');
            done();
        }, {_error_assert: 'TO_BUFFER_WRITE_ERROR'});
    });
});