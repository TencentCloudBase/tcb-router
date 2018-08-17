const TcbRouter = require("../src/server/index");
describe("req测试", () => {
    const app = new TcbRouter({
        callback: function() {},
        event: { userInfo: "xxxx", test: 123, $url: "xx" }
    });
    test("req", () => {
        expect(app._req).toMatchObject({
            event: {
                userInfo: "xxxx",
                test: 123,
                $url: "xx"
            }
        });
        expect(app._req).toHaveProperty("url", "xx");
    });
});
describe("异常抛出", () => {
    test("不传入callback报错", () => {
        expect(() => {
            const app = new TcbRouter();
        }).toThrowError(new Error("Callback must be a function"));
    });
});

describe("use方法测试", () => {
    const app = new TcbRouter({
        callback: function() {},
        event: { userInfo: "xxxx", test: 123, $url: "xx" }
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
    const app = new TcbRouter({
        callback: function() {},
        event: { userInfo: "xxxx", test: 123, $url: "xx" }
    });
    test("receive测试传入函数只有一个参数的情况", () => {
        app.receive((req, res) => {});
        expect(app._middlewares[0]).toHaveProperty("handle");
        expect(app._middlewares[0]).toHaveProperty("path", "*");
        expect(app._middlewares[0]).toHaveProperty("method", "receive");
    });
    test("receive两个参数第一个参数为字符串的情况", () => {
        app.receive("test", (req, res) => {});
        expect(app._middlewares[1]).toHaveProperty("handle");
        expect(app._middlewares[1]).toHaveProperty("path", "test");
        expect(app._middlewares[1]).toHaveProperty("method", "receive");
    });
    test("receive两个参数第一个参数为数组的情况", () => {
        app.receive(["nonono", "test", "hahaha"], (req, res) => {});
        expect(app._middlewares[2]).toHaveProperty("handle");
        expect(app._middlewares[2]).toHaveProperty("path", [
            "nonono",
            "test",
            "hahaha"
        ]);
        expect(app._middlewares[2]).toHaveProperty("method", "receive");
    });
});
describe("apply方法测试", () => {
    const customCallback = (err, data) => {
        // ... 测试使用这个模拟返回值
        return data;
    };
    test("apply 模拟运行", () => {
        const customEvent = {
            userInfo: "xxxx",
            username: "Tom",
            $url: "xx"
        };
        const app = new TcbRouter({
            callback: customCallback,
            event: customEvent,
            defaultRes: true
        });
        app.use((req, res, next) => {
            req.test = 111;
            next();
        });
        app.use("xx", (req, res, next) => {
            next();
        });
        app.receive("xx", (req, res) => {
            expect(
                res.callback(null, {
                    test: req.test
                })
            ).toMatchObject({
                code: 0,
                message: "ok",
                data: { test: 111 }
            });
        });
        app.apply();
    });
    test("传入回调函数含有异步的测试", done => {
        const customEvent = {
            userInfo: "xxxx",
            $url: "xx"
        };
        const app = new TcbRouter({
            callback: customCallback,
            event: customEvent,
            defaultRes: true
        });
        app.receive("xx", async (req, res) => {
            const result = await new Promise(resolve => {
                setTimeout(() => {
                    console.log("异步执行");
                    resolve(1);
                }, 1500);
            });
            expect(res.callback(null, { result })).toMatchObject({
                code: 0,
                message: "ok",
                data: {
                    result: 1
                }
            });
            done();
        });
        app.apply();
        console.log("apply end");
    });
    test("测试中间件把请求拦截掉+callback测试", () => {
        const customEvent = {
            userInfo: "xxxx",
            username: "Tom",
            $url: "xx",
            valid: false
        };
        const app = new TcbRouter({
            callback: customCallback,
            event: customEvent,
            defaultRes: true
        });
        app.use((req, res, next) => {
            if (req.event && req.event.valid) {
                next();
            } else {
                // 直接返回
                expect(res.callback("invalid")).toMatchObject({
                    code: 1,
                    message: "invalid",
                    data: null
                });
            }
        });
        app.use("xx", (req, res, next) => {
            next();
        });
        app.receive("xx", (req, res) => {
            console.error("看到我就算你测试通过也是错误的！！！！！");
            res.callback(null, {
                test: req.test
            });
        });
        app.apply();
    });
    test("数组匹配callback测试", () => {
        const customEvent = {
            userInfo: "xxxx",
            username: "Tom",
            $url: "test",
            valid: false
        };
        const app = new TcbRouter({
            callback: customCallback,
            event: customEvent,
            defaultRes: true
        });
        app.use(["nonono", "test", "hahaha"], (req, res, next) => {
            next();
        });
        app.receive(["nonono", "test", "hahaha"], (req, res) => {
            expect(res.callback(new Error("error"))).toMatchObject({
                code: 1,
                message: "error",
                data: null
            });
        });
        app.apply();
    });
});
