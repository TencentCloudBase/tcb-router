# tcb-router

小程序云函数路由，包含小程序端和云函数端

## API 设计阶段

## 云函数端

基于 express 风格

```bash
npm install tab-router
```

```javascript
const { TcbRouter } = require("tcb-router");

exports.main = async (event, context) => {
  const app = new TabRouter({ event, context, defaultRes: true });
  app.use((req, res, next) => {
    next();
  });
  app.use((req, res, next) => {
    if (req.xxx) {
      res.end();
    } else {
      next();
    }
  });
  app.receive("/login", () => {});
  return app;
};
```

### TabRouter 初始化

参数

- event
- context
- defaultRes : Boolean 表示是否使用默认回参

```javascript
{
    code: 0 | other， // 0 表示正常
    data: null | {}, //返回的数据
    message: '' | 'error'//出错情况下的报错信息
}
```

### req

req.body 相当于 event 的值

### res

res.body

res.code

res.message

## 小程序端

```javascript
const {TcbRouterClient} = require("tcb-router");
const client = new TcbRouterClient({
  functionName: "test", //调用的云函数名字
});
async login(){
const {data,code,message} = client.send("/login",{
username:"flytam",
password:"password"
})
}
```
