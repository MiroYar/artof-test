const webpack = require('webpack');
const path = require('path');
const fs = require('fs');

// Функция компеляции CSS или JS файла.
function compileFile(from, to, isDev, isPortfol){
    return webpack({
        entry: from,
        mode: isPortfol ? 'development' : 'production',
        devtool: isDev ? 'inline-cheap-module-source-map' : '(none)',
        output: {
            path: path.resolve(to),
            filename: `[name].js`
        },
        plugins: [
        ]
    }).run();
}

// Цикл на компеляцию всех файлов по типу JS.
module.exports = options => {
    return cb => {
        let projConf = JSON.parse(fs.readFileSync(`./projects/${options.projName}.json`, 'utf8'));
        let jsFiles = projConf.files.js;
        if (jsFiles != undefined){
            jsFiles.forEach(e => {
                let from = {};
                from[`${
                    (() => {
                        let to = e.to.match(/[^\/]+\./g);
                        return to === null ? e.from[0].match(/[^\/]+\./g)[0].match(/[^\s]+[^\.$]/g)[0] : to[0].match(/[^\s]+[^\.$]/g)[0];
                    })()
                }`] = `${projConf.root.src}${e.from}`;
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
                    options.isDev,
                    options.isPortfol
                );
            });
        }
        cb();
    }
}