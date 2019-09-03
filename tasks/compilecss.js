const gulp = require('gulp');
const glp = require('gulp-load-plugins')();
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
    // Объединение в один файл.
    .pipe(
        glp.concat(file)
    )
    // Автоустанока префиксов для кроссбраузерности.
    .pipe(
        glp.autoprefixer({
            overrideBrowserslist: ['last 2 versions'],
            cascade: false
        }),
    )
    // Сжатие CSS файла.
    .pipe(
        glp.if(!isPortfol,
            glp.cleanCss({
                level: 2
            })
        )
    )
    // Добавление карты источника (sourcemap) компиляции.
    .pipe(
        glp.if(isDev,
            glp.sourcemaps.write()
        )
    )
    // Преренос в конечную папаку.
    .pipe(
        gulp.dest(to)
    );
}

// Цикл на компеляцию всех файлов по типу CSS.
module.exports = options => {
    return cb => {
        let projConf = JSON.parse(fs.readFileSync(`./projects/${options.projName}.json`, 'utf8'));
        projConf.files.css.forEach(e => {
            let from = []; // Массив из путей к файлам для объединения их по порядку.
            e.from.forEach(path => {
                let src = `${projConf.root.src}${path}`;
                from.push(src);
            });
            compileFile(
                from,
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
                        let to = e.to.match(/[^\/]+\.[^\/]+/g);
                        return to === null ? e.from[0].match(/[^\/]+\.[^\/]+/g)[0] : to[0];
                    })()
                }`,
                options.isDev,
                options.isPortfol
            );
        });
        cb();
    }
}