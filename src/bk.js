class TcbRouter {

    constructor({ event = {} } = {}) {

        // 中间件
        this._middlewares = [];
        this._req = { event, url: event.$url };
        this._res = {};
    }

    use() {
        let path = null;
        let handler = null;

        if (arguments.length === 1) {
            path = '*';
            handler = arguments[0];
        }
        else if (arguments.length > 1) {
            path = arguments[0];
            handler = arguments[1];
        }

        if (typeof handler !== 'function') {
            return console.warn('Handler should be a function. The middleware is not installed correctly.');
        }

        this._middlewares.push({
            handler,
            path
        });
    }

    router(path = '*') {

        for (let i = 1, len = arguments.length; i < len; i++) {
            let handler = arguments[i];
            if (typeof handler !== 'function') {
                return console.warn('Handler should be a function. The middleware is not installed correctly.');
            }

            this._middlewares.push({
                handler,
                path
            });
        }
    }

    serve() {
        const fn = compose(this._middlewares);

        return new Promise((resolve, reject) => {
            fn(this).then((res) => {
                resolve(this.body);
            }).catch(reject);
        });

    }
}

function compose(middleware) {
    if (!Array.isArray(middleware)) {
        throw new TypeError('Middleware must be an array!');
    }
    for (const fn of middleware) {
        if (typeof fn !== 'object' || typeof fn.handler !== 'function') {
            throw new TypeError('Handler should be a function. The middleware is not installed correctly.');
        }
    }

    /**
     * @param {Object} context
     * @return {Promise}
     * @api public
     */

    return function (context, next) {
        // parameter 'next' is empty when this the main flow
        // last called middleware #
        let index = -1;

        // dispatch the first middleware
        return dispatch(0);

        function dispatch(i) {
            if (i <= index) {
                return Promise.reject(new Error('next() called multiple times'));
            }

            index = i;

            // get the handler and path of the middlware
            let {
                handler,
                path
            } = middleware[i];

            // check if path is array
            let pathIsArray = Array.isArray(path);
            console.log('path: ', path);
            // match route path
            if ((pathIsArray && path.includes(context._req.url))
                || path === '*' || new RegExp(`^${context._req.url}$`).test(path)) {

                // reach the end, call the last handler 
                if (i === middleware.length) {
                    handler = next;
                }

                // if handler is missing, just return Promise.resolve
                if (!handler) {
                    return Promise.resolve();
                }

                try {
                    // handle request, call handler one by one using dispatch
                    // Promise.resolve will help trigger the handler to be invoked
                    return Promise.resolve(handler(context, dispatch.bind(null, i + 1)));
                }
                catch (err) {
                    return Promise.reject(err);
                }
            }
            // if not match, skip to dispatch the next one but not call it
            else {
                return dispatch(i + 1);
            }
        }
    }
}

module.exports = TcbRouter;