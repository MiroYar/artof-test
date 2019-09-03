const gulp = require('gulp');
const glp = require('gulp-load-plugins')();

module.exports = options => {
    return () => {
        return gulp.src(options.from, {since: gulp.lastRun(options.taskName)})
        .pipe(glp.changed(options.to))
        .pipe(glp.debug({title: `${options.taskName}`}))
        .pipe(gulp.dest(options.to));
    }
}