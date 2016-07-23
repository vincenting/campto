/**
 * Created by vt on 15/10/1.
 */

'use strict'

const Promise = require('bluebird')
const fs = Promise.promisifyAll(require('fs'))
const should = require('should')

const CaptchaBuilder = require('../lib/builder')
const Topic = require('../lib/topic')

describe('test without error', function () {
  this.timeout(20000)
  const topic = Topic.rand()

  it('should callback with result and create file when use toFile', function () {
    const tempFileName = './temp.png'
    return CaptchaBuilder.toFile(topic.subject, tempFileName, {
      captchaHeight: 60
    }).then(tempPath => {
      tempPath.should.eql(tempFileName)
    }).then(function () {
      should(this.doneStatus).be.exactly(true)
      return fs.stat(tempFileName)
    })
    .then(_ => fs.unlinkSync(tempFileName))
  })

  it('should callback with result buffer when use toBuffer', function () {
    return CaptchaBuilder.toBuffer(topic.subject.split(' ')).then(function (buffer) {
      should(this.doneStatus).be.exactly(true)
      should(buffer.length > 0).be.exactly(true)
    })
  })
})
