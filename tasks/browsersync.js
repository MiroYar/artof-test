const browserSync = require('browser-sync').create();

module.exports = options => {
    return () => {
        browserSync.init({
            server: {
                baseDir: `${options.dir}`
            }
        });
        browserSync.watch(`${options.dir}`, browserSync.reload);
    }
};