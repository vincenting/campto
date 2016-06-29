/**
 * Created by vt on 15/10/1.
 */

'use strict'

const async = require('async')
const fs = require('fs')
const should = require('should')

const CaptchaBuilder = require('../lib/builder')
const Topic = require('../lib/topic')

describe('test without error', function () {
  this.timeout(20000)
  const topic = Topic.rand()

  it('should callback with result and create file when use toFile', function (done) {
    const tempFileName = './temp.png'
    CaptchaBuilder.toFile(topic.subject, tempFileName, function (err) {
      should(err).be.exactly(null)
      should(this._done_for_debug).be.exactly(true)
      fs.stat(tempFileName, function (err) {
        should(err == null).be.exactly(true)
        fs.unlinkSync(tempFileName)
        done()
      })
    }, {
      captcha_height: 10
    })
  })

  it('should callback with result buffer when use toBuffer', function (done) {
    CaptchaBuilder.toBuffer(topic.subject.split(' '), function (err, buffer) {
      should(err).be.exactly(null)
      should(this._done_for_debug).be.exactly(true)
      should(buffer.length > 0).be.exactly(true)
      done()
    })
  })
})

describe('test with all known type error', function () {
  this.timeout(20000)

  const topic = Topic.rand()
  const KNOWN_ERRORS = [
    'TEMP_FILE_CREATE_ERROR',
    'DRAW_TEMP_FILE_WRITE_ERROR',
    'WORD_TEMP_FILE_WRITE_ERROR',
    'DRAW_BACKGROUND_IMG_ERROR'
  ]

  it('should always done whatever error happened when use toFile', function (done) {
    const tempFileName = './temp.png'
    async.map(KNOWN_ERRORS, function (error, callback) {
      CaptchaBuilder.toFile(topic.subject, tempFileName, function (err) {
        should(this._done_for_debug).be.exactly(true)
        callback(null, err)
      }, {
        _error_assert: error
      })
    }, function (err, result) {
      try {
        fs.unlinkSync(tempFileName)
      } catch (_) {}
      should(err).be.exactly(null)
      result.should.eql(KNOWN_ERRORS)
      done()
    })
  })

  it('should always done whatever error happened when use toBuffer', function (done) {
    async.map(KNOWN_ERRORS, function (error, callback) {
      CaptchaBuilder.toBuffer(topic.subject, function (err) {
        should(this._done_for_debug).be.exactly(true)
        callback(null, err)
      }, {
        _error_assert: error
      })
    }, function (err, result) {
      should(err).be.exactly(null)
      result.should.eql(KNOWN_ERRORS)
      done()
    })
  })

  it('should pass error error happened in toFile', function (done) {
    const tempFileName = './temp.png'
    CaptchaBuilder.toFile(topic.subject, tempFileName, function (err) {
      should(this._done_for_debug).be.exactly(true)
      err.should.equal('TO_FILE_WRITE_ERROR')
      try {
        fs.unlinkSync(tempFileName)
      } catch (_) {}
      done()
    }, {
      _error_assert: 'TO_FILE_WRITE_ERROR'
    })
  })

  it('should pass error error happened in toBuffer', function (done) {
    CaptchaBuilder.toBuffer(topic.subject, function (err) {
      should(this._done_for_debug).be.exactly(true)
      err.should.equal('TO_BUFFER_WRITE_ERROR')
      done()
    }, {
      _error_assert: 'TO_BUFFER_WRITE_ERROR'
    })
  })
})
