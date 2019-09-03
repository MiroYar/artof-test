const fs = require('fs');
let extArr = ['css', 'js'];
let replaceCondit = {
    'sass/': 'css/',
    'scss/': 'css/',
    'pug/': 'html/'
};

// Функция получения расширения файла из строки, содержащей имя файла на конце.
function getFileExt(name){
    let e = name.match(/[\d|\w]+$/g)[0];
    return e === 'scss' ? 'sass': e;
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

// Функция каскадного чтения дерриктории и выполнение действия в случае нахождения файла.
function readFolder(dir, data, isFile){
    fs.readdirSync(dir).forEach((item) => {
        if (item != 'modules'){
            let path = `${(() => {return dir.match(/[^\s]$/)[0] === '/' ? `${dir}${item}`: `${dir}/${item}`})()}`;

            if (fs.lstatSync(path).isDirectory()) {
                readFolder(path, data, isFile);
            }
            else {
                isFile(getFileExt(item), path, data);
            }
        }
    });
    return data;
};

// Добавление записи о пути к файлу в лист в соответсвии с расширением.
function addToFileList(ext, path, data){
    if (typeof data[ext] === 'undefined'){
        data[ext] = [path];
    }
    else if (data[ext].includes(path) === false){
        data[ext].push(path);
    }
}

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

// Проверка и внесение изменений о путях к файлам в лист конфугурации проекта.
function checkProjConf(data, list){
    // Сопоставление путей к файлам между конфигурационным листом проекта (data)
    // и лист путей к файлам (list) в дирректории с последубщим удалением
    // совпадений из list (для дальнейшего добавления оставшихся в data) и
    // удалением лишних путей в data.
    for (let ext in data.files) {
        data.files[ext] = data.files[ext].filter(i => {
            if (typeof i.from === 'string') {
                let path = (() => {return data.root.src.match(/[^\s]$/)[0] === '/' ? `${data.root.src}${i.from}`: `${data.root.src}/${i.from}`})();
                if (list[ext] != undefined && list[ext].includes(path)){
                    list[ext].splice(list[ext].indexOf(path), 1);
                    if (list[ext].length === 0){
                        delete list[ext];
                    }
                    return true;
                }
                else {
                    return false;
                }
            }
            else if (i.from.length === 0){
                return false;
            }
            else {
                i.from = i.from.filter(path => {
                    path = (() => {return data.root.src.match(/[^\s]$/)[0] === '/' ? `${data.root.src}${path}`: `${data.root.src}/${path}`})();
                    if (list[ext] != undefined && list[ext].includes(path)){
                        list[ext].splice(list[ext].indexOf(path), 1);
                        if (list[ext].length === 0){
                            delete list[ext];
                        }
                        return true;
                    }
                    else {
                        return false;
                    }
                });
                if (i.from.length === 0){
                    return false;
                }
                else {
                    return true;
                }
            }
        });
        if (data.files[ext].length === 0){
            delete data.files[ext];
        }
    }

    // Добавление оставшихся в листе путей к файлам в дирректории поле предыдущей
    // процедуры в концигурационный лист проекта.
    for (let ext in list){
        list[ext].forEach(path => {
            path = path.replace(`${data.root.src}`, '');
            let from = filePathData(ext, path);
            let to = convertFromPathToPath(path);
            if (data.files[ext] === undefined){
                data.files[ext] = [{from: from, to: to}];
            }
            else {
                data.files[ext].push({from: from, to: to});
            }
        })
    }
    return data;
}

module.exports = options => {
    return cb => {
        // Архивация прежней ферсии конфигурационного файла проекта.
        fs.writeFile(`./projects/${options.projConf.projectName}_archive.json`, JSON.stringify(options.projConf, null, 4), (err) => {
            if (err) throw err;
        });
    
        // Перезапись конфигурационного файла проекта.
        let list = readFolder(`${options.projConf.root.src}`, {}, addToFileList);
        let data = checkProjConf(options.projConf, list);
        fs.writeFile(`./projects/${options.projConf.projectName}.json`, JSON.stringify(data, null, 4), (err) => {
            if (err) throw err;
            cb();
        });
    }
}