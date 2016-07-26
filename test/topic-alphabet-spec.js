/**
 * Created by vt on 15/9/29.
 */

'use strict'

const should = require('should')
const _ = require('lodash')
const alphabet = require('../lib/topics/alphabet')

describe('alphabet topic generate', function () {
  it('should always length 4', function () {
    alphabet().subject.length.should.equal(4)
  })

  _(100).times(_ => {
    alphabet().subject.indexOf('`').should.equal(-1)
  })
})
