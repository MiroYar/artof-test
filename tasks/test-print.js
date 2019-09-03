const fs = require('fs');
const del = require('del');
const replaceCondit = {
    sass: 'css',
    scss: 'css',
    pug: 'html'
};

// ТЕСТОВЫЙ ТАСК
module.exports = options => {
    return cb => {/*
        let replaceCondit = {
            'sass/': 'css/',
            'scss/': 'css/',
            'pug/': 'html/'
        };
        function replacer(input, condit){
            // input - исходная строка, condit - условия замены в виде оъекта, где
            // ключ - заменяемая часть строки, значение ключа - то, на что меняется эта часть строки.
            for (const e in condit) {
                input = input.replace(e, condit[e]);
            }
            return input;
        }*/

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

        // Функция каскадного чтения дерриктории и выполнение действия в случае нахождения файла.
        // function readFolder(dir, data, isFile){
        //     fs.readdirSync(dir).forEach((item) => {
        //         if (item != 'modules'){
        //             let path = `${(() => {return dir.match(/[^\s]$/)[0] === '/' ? `${dir}${item}`: `${dir}/${item}`})()}`;

        //             if (fs.lstatSync(path).isDirectory()) {
        //                 readFolder(path, data, isFile);
        //             }
        //             else {
        //                 isFile(getFileExt(item), path, data);
        //             }
        //         }
        //     });
        //     return data;
        // };

        function delisEmptyDirs(){

        }

        function readFolder(dir, makeWithFolder, makeWithFiles, readEnd, isEmptyDir, result = {}, options = {}){
            // dir - текущая анализируемая дирректория, makeWithFolder - функция действия
            // с найденной папкой, makeWithFiles - функция действия над найденным файлом,
            // readEnd - функция при завершении чтения текущей дирректории, isEmptyDir -
            // функция действия если данная дирректория оказалась пустой, result - объект
            // с набором оперируемых ползователем переменных и их значений,
            // options - набор служебных переменных, необходимых в процессе анализа папок, где:
            // .root - изначальная дирректория, .exception - список путей к файлам для
            // исключения их из чтения.

            if (options.root === undefined){
                options['root'] = dir;
            }
            if (options.exception === undefined){
                options['exception'] = [];
            }

            let contentList = fs.readdirSync(dir); // Список содержимого текущей дирректории.

            if (contentList.length > 0){
                contentList.forEach((item) => {
                    if (item != 'modules'){
                        let path = `${(() => {return dir.match(/[^\s]$/)[0] === '/' ? `${dir}${item}`: `${dir}/${item}`})()}`;

                        // Игнорировать чтение путей из списка исключений.
                        if (options.exception.includes(path) === false){

                            // Действие при нахождении папки в текущей дирректории.
                            if (fs.lstatSync(path).isDirectory()) {
                                if (typeof makeWithFolder === 'function'){
                                    [result = result, options = options] = [].concat(makeWithFiles(path, result, options));
                                }
                            }
                            // Действие при нахождении файла в текущей дирректории.
                            else {
                                if (typeof makeWithFiles === 'function'){
                                    [result = result, options = options] = [].concat(makeWithFiles(path, result, options));
                                }
                            }
                        }
                    }
                });
                // Действие при окончании чтения текущей дирректории.
                if (typeof readEnd === 'function'){
                    [result = result, options = options] = [].concat(readEnd(result, options));
                }
            }
            // Удаление дирректории, если она пуста.
            else {
                if (typeof isEmptyDir === 'function'){
                    isEmptyDir(dir, options);
                }
            }
            return result;
        };
/*
        let folders = []; // Список путей к папкам в данной дерриктории.
        let files = []; // Список путей к файлам в данной дирректории.
        let isFilesOnly = true; // Булевая переменная, свидетельствующая о том,
        // что текущая дирректория содержит только файлы. По умолчанию Да,
        // если не найдутся папки.
        // Составление списка путей к папкам в текущей дирректории.
        options.exception.push(path);
        files.push(path);
        // Составление списка путей к файлам в текущей дирректории.
        isFilesOnly = false;
        folders.push(path);
        // Добавление в исключения для дальнейшей обработки текущей дирректории,
        // если в ней содержатся только файлы.
        if (isFilesOnly && !options.exception.includes(dir)){
            options.exception.push(dir);
        }
        // Выполнить задачи над найденными файлами и папками в данной дирректории.
        if (typeof callback === 'function'){
            callback(files, folders, callback, isEmptyDir, options);
        }
*/
        function readFounds(files, folders, callback, isEmptyDir, options){
            if (files.length > 0){
                options['files'] === undefined ? options['files'] = files : options['files'] = options['files'].concat(files);
            }
            if (folders.length > 0){
                options['folders'] === undefined ? options['folders'] = folders : options['folders'] = options['folders'].concat(folders);
                folders.forEach(p => {
                    readFolder(p, callback, isEmptyDir, options);
                });
            }
        }

        console.log(readFolder('./build/gulp/', readFounds));

        // Добавление записи о пути к файлу в лист в соответсвии с расширением.
        function addToFileList(ext, path, data){
            if (typeof data[ext] === 'undefined'){
                data[ext] = [path];
            }
            else if (data[ext].includes(path) === false){
                data[ext].push(path);
            }
        }

        function setFileList(){
            
        }

        function checkBuildFiles(data, list){
            for (let ext in data.files){
                data.files[ext].forEach(el => {
                    let path = '';
                    if (el.to.match(/[^\/]+\.[^\/]+/g) === null){
                        let fileName = '';
                        if (typeof el.from === 'string'){
                            fileName = el.from.match(/[^\/]+\.[^\/]+/g)[0];
                        }
                        else {
                            fileName = el.from[0].match(/[^\/]+\.[^\/]+/g)[0];
                        }
                        path = `${data.root.build}${el.to}${fileName}`
                    }
                    else {
                        path = `${data.root.build}${el.to}`
                    }
                    ext = replacSerial(ext, replaceCondit);
                    if (list[ext] != undefined && list[ext].includes(path)){
                        list[ext].splice(list[ext].indexOf(path), 1);
                        if (list[ext].length === 0){
                            delete list[ext];
                        }
                    }
                });
            }
            return list;
        }
        
        // let projConf = JSON.parse(fs.readFileSync(`./projects/${options.projName}.json`, 'utf8'));
        // let list = readFolder(`${projConf.root.build}`, {}, addToFileList);
        // list = checkBuildFiles(projConf, list);

        console.log('========================', list);
        for (const ext in list){
            del(list[ext]);
        }
        cb();

    };
}