# Campto

[![NPM Version][npm-image]][npm-url]
[![NPM Downloads][downloads-image]][downloads-url]
[![Build Status][travis-image]][travis-url]
[![Test Coverage][coveralls-image]][coveralls-url]

![Campto](https://raw.githubusercontent.com/vincenting/campto/master/examples/captcha.png)

## 快速上手

首先需要安装 [GraphicsMagick](http://www.graphicsmagick.org/). Mac OS X 可以通过如下命令:

    brew install graphicsmagick

#### 1. 无缓存方案使用

该方案的优势是简单，但是由于每张验证码都需要实时生成，所以无法满足秒杀等高并发场景。

    npm install campto --save

代码示例：

    var campto = require('campto')();
    campto(function(err, buffer, result){
        // err 为系统中可能的错误
        // buffer 为验证码图片的 buffer，express 中可以直接 res.send(buffer) 返回图片（png）
        // result 为当前验证码的结果，建议放入 session 中，int10 类型。
    });

使用参考 https://github.com/vincenting/campto/blob/master/examples/simple-server/server.js

#### 2. 高并发下的缓存方案

正在开发中，请稍等。

## 开发调试

    git clone git@github.com:vincenting/campto.git
    npm install

## 运行测试

    npm test

进入 /examples/simple-server 运行 `node server.js` 启动测试服务器

## TODO

1. 完成缓存策略，即提前预生产一定数量验证码，然后一定情况下触发更新
2. 完善 API 接口设计
3. 提供更多可配置、可自定义的功能

[npm-image]: https://img.shields.io/npm/v/campto.svg
[npm-url]: https://www.npmjs.com/package/campto
[travis-image]: https://img.shields.io/travis/vincenting/campto/master.svg
[travis-url]: https://travis-ci.org/vincenting/campto
[coveralls-image]: https://img.shields.io/coveralls/vincenting/campto/master.svg
[coveralls-url]: https://coveralls.io/r/vincenting/campto?branch=master
[downloads-image]: https://img.shields.io/npm/dm/campto.svg
[downloads-url]: https://npmjs.org/package/campto