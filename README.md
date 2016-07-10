# Campto

[![NPM Downloads][downloads-image]][downloads-url]
[![Build Status][travis-image]][travis-url]
[![Test Coverage][coveralls-image]][coveralls-url]
[![Windows Tests][appveyor-image]][appveyor-url]

![Campto](https://raw.githubusercontent.com/vincenting/campto/master/examples/captcha.png)

## 快速上手

首先需要安装 [GraphicsMagick](http://www.graphicsmagick.org/). Mac OS X 可以通过如下命令:

    brew install graphicsmagick

同时请确保您的 nodejs 版本为 >= 4.0.0，0.x 版本都将于今年年底前停止支持，参考 [Nodejs LTS 现状](https://github.com/nodejs/LTS#lts_schedule)。

#### 1. 无缓存方案使用

该方案的优势是简单，但是由于每张验证码都需要实时生成，所以无法满足秒杀等高并发场景。

    npm install campto --save

代码示例：

    const campto = require('campto')();
    campto(function(err, buffer, result){
        // err 为系统中可能的错误
        // buffer 为验证码图片的 buffer，express 中可以直接 res.send(buffer) 返回图片（png）
        // result 为当前验证码的结果，建议放入 session 中，int10 类型。
    });

使用参考 https://github.com/vincenting/campto/blob/master/examples/simple-server/server.js

#### 2. 高并发下的缓存方案

即将到来。

#### 3. campto.js/campto.json 配置文件详细介绍

即将到来。

## 开发调试

    git clone git@github.com:vincenting/campto.git
    npm install

## 运行测试

    npm test
    npm run-script test-cov

进入 /examples/simple-server 运行 `node server.js` 启动测试服务器

## TODO

1. 完善、优化 API 接口设计；
2. 引入动态生成验证码背景（生成后使用临时文件重复使用）；
3. 可选验证码识别难度等级，影响背景的干扰图案、文字上图案线条干扰、以及验证码内容变形；
4. 可选多种 topic，包括固定长度的英文字母、现有的算术题、中文成语；
5. 完善高并发下缓存方案的设计；
6. 配置文件支持自定义 背景图片方式、随机颜色集、字体集、验证码大小、题目生成、自定义缓存存储。

[travis-image]: https://img.shields.io/travis/vincenting/campto/master.svg
[travis-url]: https://travis-ci.org/vincenting/campto
[coveralls-image]: https://img.shields.io/coveralls/vincenting/campto/master.svg
[coveralls-url]: https://coveralls.io/r/vincenting/campto?branch=master
[downloads-image]: https://img.shields.io/npm/dm/campto.svg
[downloads-url]: https://npmjs.org/package/campto
[climate-image]: https://codeclimate.com/github/vincenting/campto/badges/gpa.svg
[climate-url]: https://codeclimate.com/github/vincenting/campto
[appveyor-image]: https://img.shields.io/appveyor/ci/vincenting/compto/master.svg?label=Windows%20Tests
[appveyor-url]: https://ci.appveyor.com/project/vincenting/campto
