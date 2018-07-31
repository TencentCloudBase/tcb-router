# tcb-router

小程序云函数路由，包含小程序端和云函数端

## API 设计阶段

## 云函数端

基于 express 风格

```bash
npm install tcb-router
```

```javascript
const { TcbRouter } = require("tcb-router");

exports.main = async (event, context, callback) => {
    const app = new TabRouter({ event, context, defaultRes: true, callback });
    app.use((req, res, next) => {
        next();
    });
    app.use((req, res, next) => {
        if (req.xxx) {
            res.callback(null, "xxxx");
        } else {
            next();
        }
    });
    app.receive("/login", (req, res) => {});
    app.apply(); // 应用
};
```

### TabRouter 初始化

参数

-   event
-   context
-   defaultRes : Boolean 表示是否使用默认回参

```javascript
{
    code: 0 | other， // 0 表示正常
    data: null | {}, //返回的数据
    message: '' | 'error'//出错情况下的报错信息
}
```

### app.use

1、use(string,function | array[function])

### req

event 相当于 event 的值

data 小程序端的 data 字段

url 需要匹配的路径

### res

res.data

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
