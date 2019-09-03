const del = require('del');

module.exports = (options) => {
    return () => {
        return del(options.src);
    }
};