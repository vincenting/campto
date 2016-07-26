/**
 * Created by vt on 15/9/29.
 */

'use strict'

const should = require('should')
const campto = require('../')

describe('default generator', function () {
  this.timeout(20000)

  it('should run without any error', function () {
    return campto()
  })
})
