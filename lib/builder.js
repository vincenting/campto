/**
 * Created by vt on 15/9/30.
 */

'use strict'

const _ = require('lodash')
const path = require('path')
const Promise = require('bluebird')
const fs = Promise.promisifyAll(require('fs'))
const temp = Promise.promisifyAll(require('temp'))
const gm = require('gm')
const uuid = require('node-uuid')

const CAMPTO_ASSETS_PATH = path.join(__dirname, '../assets')
const DEFAULT_CAPTCHA_WIDTH = 285
const DEFAULT_CAPTCHA_HEIGHT = 50

Promise.promisifyAll(gm.prototype)
temp.track(true)

// TODO: 支持 背景图片方式、随机颜色集、字体集、验证码大小 的配置
// 其中所有参数都同时支持 Promise 以及 string 的方式传入

// @param subject 这里为 Array 类型，每一个元素应该为最小的等宽内容
// 例如一个文字、两个数字等等
const CaptchaBuilder = module.exports = function (subject, options) {
  // 预留熟悉给测试使用，确保每次处理完后缓存文件都会被清空
  this.tempFileArray = []
  this.doneStatus = false
  this.tempPrefix = uuid.v1()
  this.captchaHeight = DEFAULT_CAPTCHA_HEIGHT
  this.captchaWidth = DEFAULT_CAPTCHA_WIDTH
  this.subject = Array.isArray(subject) && subject || subject.split(' ')
  this.options = options || {}

  this.wordImgWidth = null
  this.fontSize = null
}

const _canvasBuilder = function (subject, options) {
  const captcha = new CaptchaBuilder(subject, options)
  return captcha.draw().bind(captcha).finally(captcha.done.bind(captcha))
}

CaptchaBuilder.toBuffer = function (subject, options) {
  return _canvasBuilder(subject, options).then(canvas => canvas.toBufferAsync())
}

CaptchaBuilder.toFile = function (subject, filePath, options) {
  return _canvasBuilder(subject, options).then(canvas => {
    return canvas.writeAsync(filePath)
  }).return(filePath)
}

CaptchaBuilder.prototype.draw = function () {
  this.prepareForDraw()
  return Promise.mapSeries(this.subject, this.createTempWordFile.bind(this))
    .then(wordsFiles => {
      return [wordsFiles, this.tempFile()]
    }).spread((wordsFiles, tempPath) => {
    const tempCaptcha = gm(wordsFiles.shift()).background('none')
    return tempCaptcha.append.apply(tempCaptcha, wordsFiles).append(true)
      .setFormat('png')
      .writeAsync(tempPath).return(tempPath)
  }).then(captchaPath => {
    return [captchaPath, this.createRandomLinesBackground()]
  }).spread((captchaPath, backgroundImagePath) => {
    return gm(backgroundImagePath)
      .composite(captchaPath)
      .geometry('+' + this.captchaWidth * .05 + '+0')
      .setFormat('png')
  })
}

CaptchaBuilder.prototype.prepareForDraw = function () {
  const options = this.options
  const sizeAttrs = ['captchaHeight', 'captchaWidth']
  sizeAttrs.forEach(item => {
    if (options.hasOwnProperty(item)) {
      this[item] = options[item]
    }
  })
  this.wordImgWidth = Math.floor(this.captchaWidth / this.subject.length / 1.1)
  this.fontSize = Math.ceil(Math.min(this.captchaHeight * .85, this.wordImgWidth * .9))
}

CaptchaBuilder.prototype.done = function () {
  // 这里无需处理意外，因为程序断开时会强制清除产生的所有临时文件
  const tempFileArray = this.tempFileArray.concat()
  this.doneStatus = true
  Promise.all(tempFileArray, fs.unlinkAsync)
    .then(_ => this.tempFileArray.length = 0)
}

CaptchaBuilder.prototype.tempFile = function () {
  return temp.openAsync(this.tempPrefix).then(info => {
    this.tempFileArray.push(info.path)
    return fs.closeAsync(info.fd).return(info.path)
  })
}

CaptchaBuilder.prototype.createRandomLinesBackground = function () {
  const options = this.options
  return this.tempFile().then(tempPath => {
    const backgroundLayer = gm(this.getBackgroundImagePath())
      .resize(this.captchaWidth, this.captchaHeight, '!')
    if (options.recognitionDifficulty === 'hard') {
      _.times(parseInt(this.captchaHeight / 6, 10), () => {
        const x0 = _.random(parseInt(this.captchaWidth / 1.5, 10))
        const y0 = _.random(parseInt(this.captchaHeight / 1.5, 10))
        backgroundLayer.drawLine(
          x0,
          y0,
          _.random(x0 + 1, this.captchaWidth),
          _.random(y0 + 1, this.captchaHeight)
        ).fill(this.randColor())
      })
    }
    return backgroundLayer.writeAsync(tempPath)
      .return(tempPath)
  })
}

CaptchaBuilder.prototype.createTempWordFile = function (word) {
  const options = this.options
  // 将每个内容快生产 32 像素大小随机字体随机颜色随机倾斜的临时图片
  const recognitionDifficulty = options.recognitionDifficulty || 'normal'
  return this.tempFile().then(tempPath => {
    const wordLayer = gm(this.wordImgWidth, this.captchaHeight, 'transparent')
      .fontSize(this.fontSize)
      .fill(this.randColor())
      .font(this.randFont())
      .drawText(0, 0, word, 'Center')
      .setFormat('png')
    // 正常模式增加噪点和左右变形
    if (recognitionDifficulty !== 'easy') {
      wordLayer.noise(this.randNoise())
        .rotate('transparent', _.sample([1, -1]) * parseInt(Math.random() * 15, 10))
    }
    if (recognitionDifficulty === 'hard') {
      wordLayer.affine([
        _.random(.9, 1.1), _.random(-.1, .1),
        _.random(-.1, .1), _.random(.9, 1.1),
        _.random(-.2, .1), _.random(-.2, .1)
      ]).transform()
    }
    return wordLayer
      .resize(this.wordImgWidth, this.captchaHeight)
      .scale(this.wordImgWidth, this.captchaHeight)
      .writeAsync(tempPath)
      .return(tempPath)
  })
}

CaptchaBuilder.prototype.getBackgroundImagePath = function () {
  // TODO: 该方法后期允许覆盖，即允许用户自定义背景生产方法
  return path.join(CAMPTO_ASSETS_PATH, 'images', 'bg.gif')
}

CaptchaBuilder.prototype.randFont = (() => {
  const fontsArr = []
  _(6).times(function (n) {
    fontsArr.push(path.join(CAMPTO_ASSETS_PATH, 'fonts', './0' + (n + 1) + '.ttf'))
  })
  // TODO: 这里考虑后期允许用户自定义 fontsArr
  return function () {
    return _.sample(fontsArr)
  }
})()

CaptchaBuilder.prototype.randNoise = function () {
  const noises = ['uniform', 'gaussian', 'multiplicative', 'impulse', 'poisson', 'laplacian']
  return _.sample(noises)
}

CaptchaBuilder.prototype.randColor = function () {
  // TODO: 这里考虑后期允许用户自定义 colors
  const colors = ['#000000', '#b50000', '#373000']
  return _.sample(colors)
}
