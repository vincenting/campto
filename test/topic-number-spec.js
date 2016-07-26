/**
 * Created by vt on 15/9/29.
 */

'use strict'

const should = require('should')
const _ = require('lodash')
const numberGenerate = require('../lib/topics/number')

describe('number topic generate', function () {
  it('should always length 6', function () {
    numberGenerate().subject.length.should.equal(6)
  })
})
