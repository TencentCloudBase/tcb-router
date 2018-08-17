const { TcbRouter } = require("tcb-router");
const { login, logout, verifyIdentity } = require("./controllers");

exports.main = async (event, context, callback) => {
    const app = new TcbRouter({
        callback,
        event,
        defaultRes: true
    });

    // login
    app.receive("login", login);

    // // logout
    app.receive("logout", logout);

    // verifyIdentity
    app.receive("verifyIdentity", verifyIdentity);

    await app.apply();
};
