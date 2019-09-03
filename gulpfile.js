/**ПЕРЕМЕННЫЕ ДЛЯ ПРЕДНАСТРОЙКИ */
const projName = 'artof-test'; // --------------------------------Название проекта.
const src = `./src/${projName}/`; // -----------------------Исходники проекта.
const build = `./build/${projName}/`; // -------------------Билд проекта.

/**ПОДКЛЮЧАЕМЫЕ МОДУЛИ */
const gulp = require('gulp');
const gulpif = require('gulp-if');
const args = require('yargs').argv;
const fs = require('fs');
// const browserSync = require('browser-sync').create();


/**ФУНКЦИИ */
function lazyRequareTasks(taskName, path, options){
    options = options || {};
    options.taskName = taskName;
    gulp.task(taskName, function(cb){
        let task = require(path).call(this, options);
        return task(cb);
    });
}

/**ЗАДАЧИ (TASKS) */
// Создание (флаг --new) или проверка конфигурационного файла проекта.
lazyRequareTasks('write:projconf', './tasks/writeprojconf.js', {
    projConf: (() => {
        if (args.new) {
            return {projectName: projName, root: { src: src, build: build }, files: {}};
        }
        else {
            return JSON.parse(fs.readFileSync(`./projects/${projName}.json`, 'utf8'));
        }
    })(),
});

// Компиляция CSS файлов.
lazyRequareTasks('compile:css', './tasks/compilecss.js', {
    projName: projName,
    isDev: !args.prod && !args.pfol,
    isPortfol: args.pfol
});

// Компиляция SASS файлов.
lazyRequareTasks('compile:sass', './tasks/compilesass.js', {
    projName: projName,
    isDev: !args.prod && !args.pfol,
    isPortfol: args.pfol
});

// Компиляция JS файлов.
lazyRequareTasks('compile:js', './tasks/compilejs.js', {
    projName: projName,
    isDev: !args.prod && !args.pfol,
    isPortfol: args.pfol,
    isES5: args.es5
});

// Компиляция JS файлов через WebPack.
lazyRequareTasks('webpack', './tasks/webpack.js', {
    projName: projName,
    isDev: !args.prod && !args.pfol,
    isPortfol: args.pfol
});

// Компиляция PUG файлов.
lazyRequareTasks('compile:pug', './tasks/compilepug.js', {
    projName: projName,
    isDev: !args.prod && !args.pfol,
    isProd: args.prod
});

// Копирование HTML файлов.
lazyRequareTasks('copy:assets', './tasks/copyhtml.js', {
    from: [`${src}**/*.html`, `${src}**/*.png`, `${src}**/*.svg`],
    to: build
});

// Отображение изменений в браузере.
lazyRequareTasks('browsersync', './tasks/browsersync.js', {
    dir: build
});

// Удаление всего из итоговой дирректории проекта.
lazyRequareTasks('remove:all', './tasks/removeall.js', {
    src: `${build}/*`
});

lazyRequareTasks('watch:presence', './tasks/wathpresence.js', {
    projName: projName
});

// Отслеживание изменений в файлах.
gulp.task('watch', () => {
    if (args.notprep) {
        gulp.watch(`${src}css/**/*.css`, gulp.parallel('compile:css'));
        gulp.watch(`${src}js/**/*.js`, gulp.parallel('compile:js'));
        gulp.watch(`${src}**/*.html`, gulp.parallel('copy:html'));
    }
    else {
        gulp.watch(`${src}sass/**/*.scss`, gulp.parallel('compile:sass'));
        gulp.watch(`${src}js/**/*.js`, gulp.parallel('webpack'));
        gulp.watch(`${src}**/*.pug`, gulp.parallel('compile:pug'));
    }
});

// Сборка проекта.
gulp.task('build', gulpif(!args.notprep,
    gulp.series('remove:all', 'write:projconf', gulp.parallel('compile:sass', 'webpack', 'compile:pug', 'copy:assets'), gulp.parallel('watch:presence', 'watch', 'browsersync')),
    gulp.series('remove:all', 'write:projconf', gulp.parallel('compile:css', 'compile:js', 'copy:assets'), gulp.parallel('watch:presence', 'watch', 'browsersync'))
));

// ТЕСТОВЫЙ ТАСК
lazyRequareTasks('print', './tasks/test-print.js', {
    projName: projName,
    path: `${src}scss/sass/pug/qwerscsswert.scss`
});

gulp.task('write:filelist', cb => {
    let data = readFolder(`${src}`, {}, addToFileList);
    fs.writeFile('./projects/file_list.json', JSON.stringify(data, null, 4), (err) => {
        if (err) throw err;
        cb();
    });
});