class TcbRouterClient {
    constructor({ functionName, envName }) {
        if (!wx.cloud) {
            throw new Error("尚未初始化云函数功能");
        }
        if (!functionName) {
            throw new Error("必须提供云函数名字");
        }
        this._functionName = functionName;
    }
    send(route, data) {}
}
module.exports = TcbRouterClient;
