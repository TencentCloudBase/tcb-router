# tcb-router

[![NPM version][npm-image]][npm-url]
[![Build Status](https://travis-ci.org/flytam/tcb-router.svg?branch=master)](https://travis-ci.org/flytam/tcb-router)
[![npm download][download-image]][download-url]
[![npm license][license-image]][download-url]
[![Coverage Status](https://coveralls.io/repos/github/flytam/tcb-router/badge.svg?branch=master)](https://coveralls.io/github/flytam/tcb-router?branch=master)

[npm-image]: https://img.shields.io/npm/v/tcb-router.svg?style=flat-square
[npm-url]: https://npmjs.org/package/tcb-router
[david-image]: https://img.shields.io/david/673800357/tcb-router.svg?style=flat-square
[download-image]: https://img.shields.io/npm/dm/tcb-router.svg?style=flat-square
[download-url]: https://npmjs.org/package/tcb-router
[license-image]: https://img.shields.io/npm/l/tcb-router.svg

> 基于 express 风格的小程序云函数轻量级类路由库，主要用于优化服务端函数处理逻辑

## 云函数端

使用

```bash
npm install tcb-router
```

```javascript
const TcbRouter = require("tcb-router");

exports.main = (event, context, callback) => {
    const app = new TcbRouter({ event, context, defaultRes: true, callback });
    app.use((req, res, next) => {
        // 可以像在express中那样使用中间件机制，不调用next的话就不会走到下一个路由了
        next();
    });
    app.use("xxx", (req, res, next) => {
        if (req.xxx) {
            res.callback(null, "xxxx");
        } else {
            next();
        }
    });
    app.receive("login", async (req, res) => {
        const result = await getFromDatabase();
        res.callback(null, { result });
    });

    return app.apply(); // 应用
};
```

tips: 小程序云函数的 node 环境默认支持 async/await 语法，推荐涉及到的异步操作时像 demo 中那样使用

### TcbRouter 构造函数

参数

-   event 小程序入口函数入口 event
-   defaultRes : Boolean 表示是否使用默认回参， 默认是否，即云函数提供的 callback 相同。如果传入了 true 就像下面那种的回参

```javascript
res.callback(null,{test:1})
// 相当于
{
    code: 0// 0 表示正常，1错误
    data: {test:1}), //返回的数据
    message: '' //出错情况下的报错信息
}
```

```javascript
res.callback('error')
// 相当于
{
    code: 1// 0 表示正常，1错误
    data: null, //返回的数据
    message: 'error' //出错情况下的报错信息
}
```

### app

1、use(string,function | array[function])

```javascript
// demo1 匹配所有的路径
app.use((req, res, next;) => {

});
// or
app.use("*", (req, res, next) => {});
/*******我是分割线*********/
// demo2 传入数组 从左到右直到匹配到第一项
app.use(["aaa", "bbb"], (req, res, next) => {});
// demo3 匹配指定路径
app.use("a", (req, res) => {});
```

2、receive

```javascript
// demo1 匹配所有的路径
app.receive((req, res) => {});
// or
app.receive("*", (req, res) => {});
/*******我是分割线*********/
// demo2 传入数组 从左到右直到匹配到第一项
app.receive(["aaa", "bbb"], (req, res) => {});
/*******我是分割线*********/
```

3、apply 该方法表示应用之前的中间件或者路由。涉及到异步函数操作时推荐使用时使用 async/await 进行等待

```javascript
exports.main = async (...) =>{
    const app = new TcbRouter(...)
    ....
    await app.apply();
}
```

### req

-   event: 云函数传入的 event

-   url 需要匹配的路径，通过云函数入口的 event.$url 字段传入。目前只支持精确匹配或者通配符，\*表示匹配任意路径，传入其它值是精准匹配

### res

-   res.callback 方法
    调用该方法相当于调用了 callback 方法

返回内容

## 小程序端

```javascript
// 使用自带的api调用
wx.cloud.callFunction({
    // 要调用的云函数名称
    name: "xxxx",
    // 传递给云函数的参数
    data: {
        $url: "verifyIdentity", // 要调用的路由的路径，传入准确路径或者通配符*
        other: "xxx"
    }
});
```

## 测试

```bash
yarn run test
```

## 后话

如有任何疑问和 bug 可 issue 或 pr，谢谢各位大佬

## LICENSE

MIT
