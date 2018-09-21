const TcbRouter = require('tcb-router');

exports.main = (event, context) => {
    const app = new TcbRouter({ event });

    app.use(async (ctx, next) => {
        ctx.data = {};
        await next();
    });

    app.router(['user', 'timer'], async (ctx, next) => {
        ctx.data.company = 'Tencent';
        await next();
    });

    app.router('user', async (ctx, next) => {
        ctx.data.name = 'heyli';
        await next();
    }, async (ctx, next) => {
        ctx.data.sex = 'male';
        await next();
    }, async (ctx) => {
        ctx.data.city = 'Foshan';
        ctx.body = { code: 0, data: ctx.data };
    });

    app.router('timer', async (ctx, next) => {
        ctx.data.name = 'flytam';
        await next();
    }, async (ctx, next) => {
        ctx.data.sex = await new Promise(resolve => {
            setTimeout(() => {
                resolve('male');
            }, 500);
        });
        await next();
    }, async (ctx) => {
        ctx.data.city = 'Taishan';
        ctx.body = { code: 0, data: ctx.data };
    });

    return app.serve();

}
