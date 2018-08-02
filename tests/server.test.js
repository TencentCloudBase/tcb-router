const TabRouter = require("../src/server/index");
describe("req测试", () => {
    const app = new TabRouter({
        callback: function() {},
        event: { userInfo: "xxxx", data: { test: 123, url: "/xx" } }
    });
    test("req", () => {
        expect(app._req).toHaveProperty("event", {
            userInfo: "xxxx",
            data: { test: 123, url: "/xx" }
        });
        expect(app._req).toHaveProperty("data", { test: 123, url: "/xx" });
        expect(app._req).toHaveProperty("url", "/xx");
    });
});

describe("use方法测试", () => {
    const app = new TabRouter({
        callback: function() {},
        event: { userInfo: "xxxx", data: { test: 123, url: "/xx" } }
    });
    test("use传入函数只有一个参数的情况", () => {
        app.use((req, res) => {});
        expect(app._middlewares[0]).toHaveProperty("handle");
        expect(app._middlewares[0]).toHaveProperty("path", "*");
        expect(app._middlewares[0]).toHaveProperty("method", "middleware");
    });
    test("use传入函数有两个参数的情况", () => {
        app.use("test", (req, res) => {});
        expect(app._middlewares[1]).toHaveProperty("handle");
        expect(app._middlewares[1]).toHaveProperty("path", "test");
        expect(app._middlewares[1]).toHaveProperty("method", "middleware");
    });
});
describe("receive方法测试", () => {
    const app = new TabRouter({
        callback: function() {},
        event: { userInfo: "xxxx", data: { test: 123, url: "/xx" } }
    });
    test("receive测试传入函数只有一个参数的情况", () => {
        app.receive((req, res) => {});
        expect(app._middlewares[0]).toHaveProperty("handle");
        expect(app._middlewares[0]).toHaveProperty("path", "*");
        expect(app._middlewares[0]).toHaveProperty("method", "receive");
    });
    test("receive传入函数有两个参数的情况", () => {
        app.receive("test", (req, res) => {});
        expect(app._middlewares[1]).toHaveProperty("handle");
        expect(app._middlewares[1]).toHaveProperty("path", "test");
        expect(app._middlewares[1]).toHaveProperty("method", "receive");
    });
});
describe("apply方法测试", () => {
    test("apply 模拟运行", () => {
        const customCallback = (err, data) => {
            // ...
            return data;
        };
        const customEvent = {
            userInfo: "xxxx",
            data: { username: "Tom", url: "/xx" }
        };
        const app = new TabRouter({
            callback: customCallback,
            event: customEvent,
            defaultRes: true
        });
        app.use((req, res, next) => {
            req.test = 111;
            next();
        });
        app.use("/xx", (req, res, next) => {
            next();
        });
        app.receive("/xx", (req, res) => {
            expect(
                res.callback(null, {
                    test: req.test
                })
            ).toMatchObject({
                code: 0,
                message: null,
                data: { test: 111 }
            });
        });
        app.apply();
    });
    test("测试中间件把请求拦截掉",() =>{
        const customCallback = (err, data) => {
            // ...
            return data;
        };
        const customEvent = {
            userInfo: "xxxx",
            data: { username: "Tom", url: "/xx",valid:false }
        };
        const app = new TabRouter({
            callback: customCallback,
            event: customEvent,
            defaultRes: true
        });
        app.use((req, res, next) => {
            if (req.event && req.event.valid){
                next();
            }else{
                // 直接返回
                expect(
                    res.callback('invalid')
                ).toMatchObject({
                    code: 1,
                    message: 'invalid',
                    data: null
                });
            }
           
        });
        app.use("/xx", (req, res, next) => {
            console.log(111)
            next();
        });
        app.receive("/xx", (req, res) => {
                res.callback(null, {
                    test: req.test
                })
        });
        app.apply();
    })
});
