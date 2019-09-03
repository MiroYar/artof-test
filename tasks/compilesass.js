const gulp = require('gulp');
const glp = require('gulp-load-plugins')();
const sass = require('gulp-sass');
const fs = require('fs');

// Функция компеляции CSS или JS файла.
function compileFile(from, to, file, isDev, isPortfol){
    gulp.src(from)
    // Инициализация карты источника (sourcemap) компиляции.
    .pipe(
        glp.if(isDev,
            glp.sourcemaps.init()
        )
    )
    // Компиляция SASS в один CSS файл с возможным сжатием.
    .pipe(
        sass({
            // outputStyle: isPortfol ? 'expanded' : 'compressed'
        })
        .on('error', sass.logError)
    )
    .pipe(
        glp.if(!isPortfol,
            glp.cssnano()
        )
    )
    // Автоустанока префиксов для кроссбраузерности.
    .pipe(
        glp.autoprefixer({
            overrideBrowserslist: ['last 2 versions'],
            cascade: false
        }),
    )
    // Добавление карты источника (sourcemap) компиляции.
    .pipe(
        glp.if(isDev,
            glp.sourcemaps.write()
        )
    )
    // Переименование файла.
    .pipe(
        glp.if(file != '',
            glp.rename({
                basename: `${file}`
            })
        )
    )
    // Преренос в конечную папаку.
    .pipe(
        gulp.dest(to)
    );
}

// Цикл на компеляцию всех файлов по типу SASS.
module.exports = options => {
    return cb => {
        let projConf = JSON.parse(fs.readFileSync(`./projects/${options.projName}.json`, 'utf8'));
        projConf.files.sass.forEach(e => {
            compileFile(
                `${projConf.root.src}${e.from}`,
                `${
                    projConf.root.build
                }${
                    (() => {
                        let to = e.to.match(/[^\s]+[\/]/);
                        return to === null ? '' : to[0];
                    })()
                }`,
                `${
                    (() => {
                        let to = e.to.match(/[^\/]+\./g);
                        return to === null ? '' : to[0].match(/[^\s]+[^\.$]/g)[0];
                    })()
                }`,
                options.isDev,
                options.isPortfol
            );
        });
        cb();
    }
}
