const gulp = require('gulp');
const glp = require('gulp-load-plugins')();
const fs = require('fs');

// Функция компеляции CSS или JS файла.
function compileFile(from, to, file, isDev, isPortfol, isES5){
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
    // Транспиляция кода на стандарт ES5.
    .pipe(
        glp.if(isES5,
            glp.babel({
                presets: ['@babel/preset-env']
            })
        )
    )
    // Сжатие JS файла.
    .pipe(
        glp.if(!isPortfol && isES5,
            glp.uglify({
                toplevel: true
            })
        )
    )
    .pipe(
        glp.if(!isPortfol && !isES5,
            glp.minify({
                ext:{
                    src:'-debug.js',
                    min:'.js'
                }
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

// Цикл на компеляцию всех файлов по типу JS.
module.exports = options => {
    return cb => {
        let projConf = JSON.parse(fs.readFileSync(`./projects/${options.projName}.json`, 'utf8'));
        projConf.files.js.forEach(e => {
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
                        let file = e.to.match(/[^\/]+\.[^\/]+/g);
                        return file === null ? e.from[0].match(/[^\/]+\.[^\/]+/g)[0] : file[0];
                    })()
                }`,
                options.isDev,
                options.isPortfol,
                options.isES5
            );
        });
        cb();
    }
}