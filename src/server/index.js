const Res = require("./lib/res");
class TabRouter {
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
                    return old_callback(null, new Res({ data }));
                }
            };
        }
        this._req = { event, data: event.data, url: event.data.url };
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
        const next = err => {
            if (index === this._middlewares.length) {
                this._res.callback("无法匹配");
                return;
            } else if (err) {
                this._res.callback(err);
            } else {
                const { handle, method, path } = this._middlewares[index++];
                if (
                    path === "*" ||
                    new RegExp(`^${this._req.url}$`).test(path)
                ) {
                    if (method === "middleware") {
                        // 中间件
                        handle(this._req, this._res, next);
                    } else {
                        // 路由
                        handle(this._req, this._res);
                    }
                } else {
                    index++;
                    next();
                }
            }
        };
        next();
    }
}
module.exports = TabRouter;
