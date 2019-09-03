const gulp = require('gulp');
const glp = require('gulp-load-plugins')();
const pug = require('gulp-pug');
const fs = require('fs');

// Функция компеляции CSS или JS файла.
function compileFile(from, to, file, isDev, isProd){
    gulp.src(from)
    // Инициализация карты источника (sourcemap) компиляции.
    .pipe(
        glp.if(isDev,
            glp.sourcemaps.init()
        )
    )
    // Компиляция PUG в один HTML файл с возможным сжатием.
    .pipe(
        pug({
            pretty: !isProd
        })
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
        projConf.files.pug.forEach(e => {
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
                options.isProd
            );
        });
        cb();
    }
}