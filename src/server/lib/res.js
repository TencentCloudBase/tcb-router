module.exports = function({ data = null, message = null, code = 0 }) {
    this.data = data;
    this.message = message;
    this.code = code;
};
