# Campto

[![NPM Downloads][downloads-image]][downloads-url]
[![Build Status][travis-image]][travis-url]
[![Test Coverage][coveralls-image]][coveralls-url]
[![Windows Tests][appveyor-image]][appveyor-url]

![Campto](https://raw.githubusercontent.com/vincenting/campto/master/assets/captchas/default.png)

## 特色功能

1. 可配置验证码的生成难度；
2. 可配置验证码宽高颜色字体以及背景；
3. 多种预设 Topic(验证码内容生成器)，同时可以引入自定义的内容。

## 快速上手

首先需要安装 [GraphicsMagick](http://www.graphicsmagick.org/). 

* Mac OS X: `brew install graphicsmagick`
* Debian Linux: `apt-get install graphicsmagick`
* 其他系统请至官网下载 [官网链接](http://www.graphicsmagick.org)

同时请确保您的 nodejs 版本为 >= 4.0.0，0.x 版本都将于今年年底前停止支持，参考 [Nodejs LTS 现状](https://github.com/nodejs/LTS#lts_schedule)。

#### 1. 无缓存方案使用

该方案的优势是简单，并且可以针对每张验证码单独使用配置。但是由于每张验证码都需要实时生成，所以无法满足秒杀等并发较高的场景。

    npm install campto --save

代码示例：

```javascript
const campto = require('campto')
campto(options).then(captcha => {
  // captcha.buffer 为验证码图片的 buffer，express 中可以直接 res.send(buffer) 返回图片（png）
  // captcha.result 为当前验证码的结果，建议放入 session 中，int10 类型。
})
```

这里的 options 为可选参数，和 `campto.[json|js]` 基本一致，例如 `options` 可以指定当前生成验证码的识别难度 `[easy|normal|hard]` ：

```javascript
const campto = require('campto')
campto({
  recognitionDifficulty: 'hard'
}).then(...)
```

使用参考 https://github.com/vincenting/campto/blob/master/examples/simple-server/server.js 。
更多参数请参考 [campto.[json|js] 配置文件详细介绍](#3-camptojsonjs-配置文件详细介绍)

#### 2. 高并发下的缓存方案

即将到来。

#### 3. campto.[json|js] 配置文件详细介绍

```javascript
{
  "captchaHeight": Int, 验证码高度，默认 50,
  "captchaWidth": Int, 验证码宽度，默认 285,
  "randColorSet": []String, 随机颜色集，用于文字和线条，默认 ['#000000', ...],
  "backgroundSet": []String，随机背景图片路径集合，建议高度宽度与验证码一致,
  "fontFileSet": []String，随机验证码字体文件路径集合,
  "recognitionDifficulty": String, 验证码识别难度，默认为 "normal"，可选 easy|normal|hard
}
```

#### 4. API 介绍

即将到来。

## 开发调试

```shell
git clone git@github.com:vincenting/campto.git
npm install
```

## 运行测试

```shell
npm test
npm run test-cov
```

进入 /examples/simple-server 运行 `node server.js` 启动测试服务器

## TODO

1. 完善高并发下缓存方案的设计；
2. `lib/builder` 中目前由于对 `gm` 熟悉度优先，通过临时文件拼接产生验证码的方式xuyåo改进。

[travis-image]: https://img.shields.io/travis/vincenting/campto/master.svg
[travis-url]: https://travis-ci.org/vincenting/campto
[coveralls-image]: https://img.shields.io/coveralls/vincenting/campto/master.svg
[coveralls-url]: https://coveralls.io/r/vincenting/campto?branch=master
[downloads-image]: https://img.shields.io/npm/dm/campto.svg
[downloads-url]: https://npmjs.org/package/campto
[appveyor-image]: https://img.shields.io/appveyor/ci/vincenting/campto/master.svg?label=Windows%20Tests
[appveyor-url]: https://ci.appveyor.com/project/vincenting/campto
