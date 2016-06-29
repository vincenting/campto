/**
 * Created by vt on 15/10/3.
 */

'use strict'

const express = require('express')
const session = require('express-session')
const path = require('path')
const bodyParser = require('body-parser')
const Campto = require('../../')

const campto = Campto()
const app = express()

app.use(session({
  secret: 'heloCampto',
  resave: false,
  saveUninitialized: true
}))

app.use(bodyParser.urlencoded({
  extended: true
}))

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, './index.html'))
})

app.get('/captcha', function (req, res) {
  campto(function (err, buffer, result) {
    if (err) throw error
    req.session['captcha'] = result + ''
    res.contentType = 'image/png'
    res.send(buffer)
  })
})

app.post('/captcha', function (req, res) {
  if (req.body['captcha'] === req.session['captcha']) {
    return res.send('验证码通过')
  }
  res.send('验证码失败！\n' + req.body['captcha'] + ' 不等于 ' + req.session['captcha'])
})

const server = app.listen(3000, function () {
  const host = server.address().address
  const port = server.address().port

  console.log('Example app listening at http://%s:%s', host, port)
})
