const Res = require("./lib/res");
class TcbRouter {
    constructor({ event, defaultRes, callback }) {
        if (!callback || typeof callback !== "function") {
            throw new Error("Callback must be a function");
        }
        this._middlewares = [];
        const old_callback = callback;
        if (defaultRes) {
            callback = (err, data) => {
                if (err) {
                    if (err.message) {
                        err = err.message;
                    }
                    return old_callback(
                        null,
                        new Res({ message: err, code: 1 })
                    );
                } else {
                    return old_callback(null, new Res({ data, message: "ok" }));
                }
            };
        }
        this._req = { event, url: event.url };
        this._res = { callback };
    }
    receive(path, handle) {
        // 这个东西是否需要
        if (typeof handle !== "function") {
            handle = path;
            path = "*";
        }
        this._middlewares.push({ handle, path, method: "receive" });
    }
    use(path, handle) {
        if (typeof handle !== "function") {
            handle = path;
            path = "*";
        }
        this._middlewares.push({ handle, path, method: "middleware" });
    }
    apply() {
        // 相当于http来了
        let index = 0;

        let goNext = true;

        const makeNextTrue = () => {
            console.log("调用next");
            goNext = true;
        };
        // 该用while
        while (index < this._middlewares.length && goNext) {
            const { handle, method, path } = this._middlewares[index++];
            if (
                path === "*" ||
                new RegExp(`^${this._req.url}$`).test(path) // 暂时只精准匹配
            ) {
                goNext = false;
                if (method === "middleware") {
                    // 中间件
                    console.log("进入中间件");
                    handle(this._req, this._res, makeNextTrue);
                } else {
                    // 路由
                    console.log("本次调用路由路径", path);
                    return handle(this._req, this._res);
                }
            }
        }
    }
}
module.exports = TcbRouter;
