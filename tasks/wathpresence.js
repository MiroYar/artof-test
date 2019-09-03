const gulp = require('gulp');
const fs = require('fs');
let extArr = ['css', 'js'];
let replaceCondit = {
    'sass/': 'css/',
    'scss/': 'css/',
    'pug/': 'html/'
};

// Проверка наличия записи о пути к файлу.
function filePathIsAvailable(ext, path, data){
    let isAvailable = false;
    data.files[ext].forEach(i => {
        if (typeof i.from === 'string'){
            if (i.from === path) {
                return isAvailable = true;
            }
        }
        else {
            if (i.from.includes(path)){
                return isAvailable = true;
            }
        }
    });
    return isAvailable;
};

// Запись о пути файла в соответсвии с типом (массив строк или строка) в
// зависимости от расширения файла.
function filePathData(ext, path){
    if (extArr.includes(ext)){
        return [`${path}`];
    }
    else {
        return `${path}`;
    }
};

// Функция серийной замены найденных значений в строке.
function replacSerial(input, condit){
    // input - исходная строка, condit - условия замены в виде оъекта, где
    // ключ - заменяемая часть строки, значение ключа - то, на что меняется эта часть строки.
    for (const e in condit) {
        input = input.replace(e, condit[e]);
    }
    return input;
}

// Функция конвертации пути к файлу в исходниках в путь до билда.
function convertFromPathToPath(path){
    let to = path.match(/[^\s]+[\/]/);
    return to === null ? '' : replacSerial(to[0], replaceCondit);
}

// Функция получения расширения файла из строки, содержащей имя файла на конце.
function getFileExt(name){
    let e = name.match(/[\d|\w]+$/g)[0];
    return e === 'scss' ? 'sass': e;
};

// Добавление отсутсвующего пути к файлу в концигурационный лист проекта.
function addPathInProjConf(ext, path, data){
    path = path.replace(`${data.root.src}`, '');
    let from = filePathData(ext, path);
    let to = convertFromPathToPath(path);
    if (typeof data.files[ext] === 'undefined'){
        data.files[ext] = [{from: from, to: to}];
    }
    else if (filePathIsAvailable(ext, path, data) === false){
        data.files[ext].push({from: from, to: to});
    }
    return data;
}

// Удаление пути к файлу в конфигурационном листе после его удаления из дерриктории.
function removePathInProjConf(ext, path, data){
    path = path.replace(`${data.root.src}`, '');

    data.files[ext].forEach(i => {
        if (typeof i.from === 'string'){
            if (i.from === path){
                data.files[ext].splice(data.files[ext].indexOf(i), 1);
                if (data.files[ext].length === 0){
                    delete data.files[ext];
                }
            }
        }
        else {
            i.from.forEach(e => {
                if (e === path){
                    i.from.splice(i.from.indexOf(e), 1);
                    if (i.from.length === 0){
                        data.files[ext].splice(data.files[ext].indexOf(i), 1);
                        if (data.files[ext].length === 0){
                            delete data.files[ext];
                        }
                    }
                }
            });
        }
    });
    return data;
}

module.exports = options => {
    return () => {
        const projConf = JSON.parse(fs.readFileSync(`./projects/${options.projName}.json`, 'utf8'))
        const watcher = gulp.watch(`${projConf.root.src}**/*.*`, {ignored: /modules/});
        watcher.on('add', path => {
            path = `./${path.match(/[^\\]+/g).reduce((result, item) => { return `${result}/${item}` })}`;
            
            // Архивация прежней ферсии конфигурационного файла проекта.
            fs.writeFile(`./projects/${projConf.projectName}_archive.json`, JSON.stringify(projConf, null, 4), (err) => {
                if (err) throw err;
            });

            // Добавление отсутсвующего пути к файлу в концигурационный лист проекта
            // после добавления файла в дирректорию.
            let data = addPathInProjConf(getFileExt(path), path, projConf);
            fs.writeFile(`./projects/${projConf.projectName}.json`, JSON.stringify(data, null, 4), (err) => {
                if (err) throw err;
            });
        });
        watcher.on('unlink', path => {
            path = `./${path.match(/[^\\]+/g).reduce((result, item) => { return `${result}/${item}` })}`;

            // Архивация прежней ферсии конфигурационного файла проекта.
            fs.writeFile(`./projects/${projConf.projectName}_archive.json`, JSON.stringify(projConf, null, 4), (err) => {
                if (err) throw err;
            });

            // Удаление лишнего пути к файлу из концигурационного листа проекта после
            // удаления файла из дерриктории.
            let data = removePathInProjConf(getFileExt(path), path, projConf);
            fs.writeFile(`./projects/${projConf.projectName}.json`, JSON.stringify(data, null, 4), (err) => {
                if (err) throw err;
            });
        });
    }
}