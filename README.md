## 开发调试
首先需要安装 [GraphicsMagick](http://www.graphicsmagick.org/). Mac OS X 可以通过如下命令:

    brew install graphicsmagick
    git clone git@github.com:vincenting/campto.git
    npm install

## 运行测试

    npm test

进入 /examples/simple-server 运行 `node server.js` 启动测试服务器

## TODO

1. 完成缓存策略，即提前预生产一定数量验证码，然后一定情况下触发更新
2. 完善 API 接口设计
3. 提供更多可配置、可自定义的功能