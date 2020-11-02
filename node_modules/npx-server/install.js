#!/usr/bin/env node

const path  = require('path');

const fs    = require('fs');

const createIgnoreFilter = (ignorefile, root) => {

    let ignore = fs.readFileSync(ignorefile).toString();

    ignore = ignore.split("\n").map(n => n.trim()).filter(n => n.indexOf('#') !== 0).map(n => n.indexOf('/') === 0 ? n.substring(1) : n).filter(Boolean);

    /**
     * https://www.npmjs.com/package/ignore v4.0.2
     * updated to: v5.1.3
     * manually compressed
     */
    const ignoretool = (function () {

        const module = {};

        // just paste here compressed code vvv from: https://github.com/kaelzhang/node-ignore/blob/master/index.js
        // just paste here compressed code vvv after compression through: https://skalman.github.io/UglifyJS-online/
        // just paste here compressed code vvv

        function makeArray(e){return Array.isArray(e)?e:[e]}const REGEX_TEST_BLANK_LINE=/^\s+$/,REGEX_REPLACE_LEADING_EXCAPED_EXCLAMATION=/^\\!/,REGEX_REPLACE_LEADING_EXCAPED_HASH=/^\\#/,REGEX_SPLITALL_CRLF=/\r?\n/g,REGEX_TEST_INVALID_PATH=/^\.*\/|^\.+$/,SLASH="/",KEY_IGNORE="undefined"!=typeof Symbol?Symbol.for("node-ignore"):"node-ignore",define=(e,t,r)=>Object.defineProperty(e,t,{value:r}),REGEX_REGEXP_RANGE=/([0-z])-([0-z])/g,sanitizeRange=e=>e.replace(REGEX_REGEXP_RANGE,(e,t,r)=>t.charCodeAt(0)<=r.charCodeAt(0)?e:""),REPLACERS=[[/\\?\s+$/,e=>0===e.indexOf("\\")?" ":""],[/\\\s/g,()=>" "],[/[\\^$.|*+(){]/g,e=>`\\${e}`],[/\[([^\]/]*)($|\])/g,(e,t,r)=>"]"===r?`[${sanitizeRange(t)}]`:`\\${e}`],[/(?!\\)\?/g,()=>"[^/]"],[/^\//,()=>"^"],[/\//g,()=>"\\/"],[/^\^*\\\*\\\*\\\//,()=>"^(?:.*\\/)?"],[/(?:[^*])$/,e=>/\/$/.test(e)?`${e}$`:`${e}(?=$|\\/$)`],[/^(?=[^^])/,function(){return/\/(?!$)/.test(this)?"^":"(?:^|\\/)"}],[/\\\/\\\*\\\*(?=\\\/|$)/g,(e,t,r)=>t+6<r.length?"(?:\\/[^\\/]+)*":"\\/.+"],[/(^|[^\\]+)\\\*(?=.+)/g,(e,t)=>`${t}[^\\/]*`],[/(\^|\\\/)?\\\*$/,(e,t)=>{return`${t?`${t}[^/]+`:"[^/]*"}(?=$|\\/$)`}],[/\\\\\\/g,()=>"\\"]],regexCache=Object.create(null),makeRegex=(e,t,r)=>{const i=regexCache[e];if(i)return i;const n=REPLACERS.reduce((t,r)=>t.replace(r[0],r[1].bind(e)),e);return regexCache[e]=r?new RegExp(n,"i"):new RegExp(n)},isString=e=>"string"==typeof e,checkPattern=e=>e&&isString(e)&&!REGEX_TEST_BLANK_LINE.test(e)&&0!==e.indexOf("#"),splitPattern=e=>e.split(REGEX_SPLITALL_CRLF);class IgnoreRule{constructor(e,t,r,i){this.origin=e,this.pattern=t,this.negative=r,this.regex=i}}const createRule=(e,t)=>{const r=e;let i=!1;0===e.indexOf("!")&&(i=!0,e=e.substr(1)),e=e.replace(REGEX_REPLACE_LEADING_EXCAPED_EXCLAMATION,"!").replace(REGEX_REPLACE_LEADING_EXCAPED_HASH,"#");const n=makeRegex(e,0,t);return new IgnoreRule(r,e,i,n)},throwError=(e,t)=>{throw new t(e)},checkPath=(e,t,r)=>{if(!isString(e))return r(`path must be a string, but got \`${t}\``,TypeError);if(!e)return r("path must not be empty",TypeError);if(checkPath.isNotRelative(e)){return r(`path should be a ${"`path.relative()`d"} string, but got "${t}"`,RangeError)}return!0},isNotRelative=e=>REGEX_TEST_INVALID_PATH.test(e);checkPath.isNotRelative=isNotRelative,checkPath.convert=(e=>e);class Ignore{constructor({ignorecase:e=!0}={}){this._rules=[],this._ignorecase=e,define(this,KEY_IGNORE,!0),this._initCache()}_initCache(){this._ignoreCache=Object.create(null),this._testCache=Object.create(null)}_addPattern(e){if(e&&e[KEY_IGNORE])return this._rules=this._rules.concat(e._rules),void(this._added=!0);if(checkPattern(e)){const t=createRule(e,this._ignorecase);this._added=!0,this._rules.push(t)}}add(e){return this._added=!1,makeArray(isString(e)?splitPattern(e):e).forEach(this._addPattern,this),this._added&&this._initCache(),this}addPattern(e){return this.add(e)}_testOne(e,t){let r=!1,i=!1;return this._rules.forEach(n=>{const{negative:s}=n;i===s&&r!==i||s&&!r&&!i&&!t||n.regex.test(e)&&(r=!s,i=s)}),{ignored:r,unignored:i}}_test(e,t,r,i){const n=e&&checkPath.convert(e);return checkPath(n,e,throwError),this._t(n,t,r,i)}_t(e,t,r,i){if(e in t)return t[e];if(i||(i=e.split(SLASH)),i.pop(),!i.length)return t[e]=this._testOne(e,r);const n=this._t(i.join(SLASH)+SLASH,t,r,i);return t[e]=n.ignored?n:this._testOne(e,r)}ignores(e){return this._test(e,this._ignoreCache,!1).ignored}createFilter(){return e=>!this.ignores(e)}filter(e){return makeArray(e).filter(this.createFilter())}test(e){return this._test(e,this._testCache,!0)}}const factory=e=>new Ignore(e),returnFalse=()=>!1,isPathValid=e=>checkPath(e&&checkPath.convert(e),e,returnFalse);if(factory.isPathValid=isPathValid,factory.default=factory,module.exports=factory,"undefined"!=typeof process&&(process.env&&process.env.IGNORE_TEST_WIN32||"win32"===process.platform)){const e=e=>/^\\\\\?\\/.test(e)||/["<>|\u0000-\u001F]+/u.test(e)?e:e.replace(/\\/g,"/");checkPath.convert=e;const t=/^[a-z]:\//i;checkPath.isNotRelative=(e=>t.test(e)||isNotRelative(e))}

        // just paste here compressed code ^^^
        // just paste here compressed code ^^^
        // just paste here compressed code ^^^


        return module.exports;

    }());

//     const ig = ignoretool().add(['*.js']);
//
// // to extract filtered list of paths
//     const filtered = ig.filter(paths)        // ['.abc/d/e.js']
//
//     console.log(filtered)
//
// // to check one path
//     const isfiltered = ig.ignores('.abc/a.js');
//
//     console.log(isfiltered ? 'true' : 'false');

    /*!
     * @version 1.0 - 2013-05-21
     * @author Szymon Działowski
     * direction : 'rl'|'r'|'l'   -->   (undefined => 'rl')
     * charlist  : (undefined => " \n")
     */
    function trim(string, charlist, direction) {
        direction = direction || 'rl';
        charlist  = (charlist || '').replace(/([.?*+^$[\]\\(){}|-])/g,'\\$1');
        charlist  = charlist || " \\n";
        (direction.indexOf('r')+1) && (string = string.replace(new RegExp('^(.*?)['+charlist+']*$','gm'),'$1'));
        (direction.indexOf('l')+1) && (string = string.replace(new RegExp('^['+charlist+']*(.*)$','gm'),'$1'));
        return string;
    }

    const ig = ignoretool().add(ignore);

    const len = (root || __dirname).length;

    return file => {

        file = file.substring(len);

        file = trim(file, '\\/', 'l');

        let test;

        if (file) {
            test = !ig.ignores(file);
        }
        else {
            test = true;
        }

        // const dump = {};
        //
        // dump[file] = test;

        // if (file) {
        //
        //     if (test) {
        //         console.log(`+ ${file} ++++++`);
        //     }
        //     else {
        //         console.log(`- ${file}`);
        //     }
        // }

        // false - ignore file
        // true - copy file
        return test;
    }
};

/**
 * https://github.com/AvianFlu/ncp
 */
function ncp (source, dest, options, callback, replace) {
    var cback = callback;

    if (!callback) {
        cback = options;
        options = {};
    }

    var basePath = process.cwd(),
        currentPath = path.resolve(basePath, source),
        targetPath = path.resolve(basePath, dest),
        filter = options.filter,
        rename = options.rename,
        transform = options.transform,
        clobber = options.clobber !== false,
        modified = options.modified,
        dereference = options.dereference,
        errs = null,
        started = 0,
        finished = 0,
        running = 0,
        limit = options.limit || ncp.limit || 16;

    limit = (limit < 1) ? 1 : (limit > 512) ? 512 : limit;

    startCopy(currentPath);

    function startCopy(source) {
        started++;
        if (filter) {
            if (filter instanceof RegExp) {
                if (!filter.test(source)) {
                    return cb(true);
                }
            }
            else if (typeof filter === 'function') {
                if (!filter(source)) {
                    return cb(true);
                }
            }
        }
        return getStats(source);
    }

    function getStats(source) {
        var stat = dereference ? fs.stat : fs.lstat;
        if (running >= limit) {
            return setImmediate(function () {
                getStats(source);
            });
        }
        running++;
        stat(source, function (err, stats) {
            var item = {};
            if (err) {
                return onError(err);
            }

            // We need to get the mode from the stats object and preserve it.
            item.name = source;
            item.mode = stats.mode;
            item.mtime = stats.mtime; //modified time
            item.atime = stats.atime; //access time

            if (stats.isDirectory()) {
                return onDir(item);
            }
            else if (stats.isFile()) {
                return onFile(item);
            }
            else if (stats.isSymbolicLink()) {
                // Symlinks don't really need to know about the mode.
                return onLink(source);
            }
        });
    }

    function onFile(file) {
        var target = file.name.replace(currentPath, targetPath);
        if(rename) {
            target =  rename(target);
        }
        isWritable(target, function (writable) {
            if (writable) {
                return copyFile(file, target);
            }
            if(clobber) {
                rmFile(target, function () {
                    copyFile(file, target);
                });
            }
            if (modified) {
                var stat = dereference ? fs.stat : fs.lstat;
                stat(target, function(err, stats) {
                    //if souce modified time greater to target modified time copy file
                    if (file.mtime.getTime()>stats.mtime.getTime())
                        copyFile(file, target);
                    else return cb();
                });
            }
            else {
                return cb();
            }
        });
    }

    function copyFile(file, target) {
        var readStream = fs.createReadStream(file.name),
            writeStream = fs.createWriteStream(target, { mode: file.mode });

        readStream.on('error', onError);
        writeStream.on('error', onError);

        if(transform) {
            transform(readStream, writeStream, file);
        } else {
            writeStream.on('open', function() {
                readStream.pipe(writeStream);
            });
        }
        writeStream.once('finish', function() {
            if (modified) {
                //target file modified date sync.
                fs.utimesSync(target, file.atime, file.mtime);
                cb();
            }
            else cb();

            if (replace) {

                let tmp = fs.readFileSync(target).toString();

                Object.keys(replace).forEach(key => {
                    tmp = tmp.replace(key, replace[key]);
                });

                fs.writeFileSync(target, tmp);
            }
        });
    }

    function rmFile(file, done) {
        fs.unlink(file, function (err) {
            if (err) {
                return onError(err);
            }
            return done();
        });
    }

    function onDir(dir) {
        var target = dir.name.replace(currentPath, targetPath);
        isWritable(target, function (writable) {
            if (writable) {
                return mkDir(dir, target);
            }
            copyDir(dir.name);
        });
    }

    function mkDir(dir, target) {
        fs.mkdir(target, dir.mode, function (err) {
            if (err) {
                return onError(err);
            }
            copyDir(dir.name);
        });
    }

    function copyDir(dir) {
        fs.readdir(dir, function (err, items) {
            if (err) {
                return onError(err);
            }
            items.forEach(function (item) {
                startCopy(path.join(dir, item));
            });
            return cb();
        });
    }

    function onLink(link) {
        var target = link.replace(currentPath, targetPath);
        fs.readlink(link, function (err, resolvedPath) {
            if (err) {
                return onError(err);
            }
            checkLink(resolvedPath, target);
        });
    }

    function checkLink(resolvedPath, target) {
        if (dereference) {
            resolvedPath = path.resolve(basePath, resolvedPath);
        }
        isWritable(target, function (writable) {
            if (writable) {
                return makeLink(resolvedPath, target);
            }
            fs.readlink(target, function (err, targetDest) {
                if (err) {
                    return onError(err);
                }
                if (dereference) {
                    targetDest = path.resolve(basePath, targetDest);
                }
                if (targetDest === resolvedPath) {
                    return cb();
                }
                return rmFile(target, function () {
                    makeLink(resolvedPath, target);
                });
            });
        });
    }

    function makeLink(linkPath, target) {
        fs.symlink(linkPath, target, function (err) {
            if (err) {
                return onError(err);
            }
            return cb();
        });
    }

    function isWritable(path, done) {
        fs.lstat(path, function (err) {
            if (err) {
                if (err.code === 'ENOENT') return done(true);
                return done(false);
            }
            return done(false);
        });
    }

    function onError(err) {
        if (options.stopOnError) {
            return cback(err);
        }
        else if (!errs && options.errs) {
            errs = fs.createWriteStream(options.errs);
        }
        else if (!errs) {
            errs = [];
        }
        if (typeof errs.write === 'undefined') {
            errs.push(err);
        }
        else {
            errs.write(err.stack + '\n\n');
        }
        return cb();
    }

    function cb(skipped) {
        if (!skipped) running--;
        finished++;
        if ((started === finished) && (running === 0)) {
            if (cback !== undefined ) {
                return errs ? cback(errs) : cback(null);
            }
        }
    }
}

const mkdirP = require(path.resolve(__dirname, 'lib', 'mkdirp'));

/**
 * https://codepen.io/stopsopa/pen/RJYZgj?editors=0010
 */
const allChain = function (arrayOfFunctions, slots) {
    var output = [], count = 0;
    (slots > 0) || (slots = 1);
    return new Promise(function (resolve, reject) {
        let stop = false;
        (function next() {

            if (stop) {
                return;
            }

            if (arrayOfFunctions.length) {
                if (count < slots) {
                    count += 1;
                    arrayOfFunctions.shift()().then(function (data) {
                        output.push(data);
                        count -= 1;
                        next();
                    }, err => {
                        stop = true;
                        reject(err);
                    });

                    next();
                }
                return;
            }
            count || resolve(output);
        }());
    });
};

// console.log(JSON.stringify({
//     'process.cwd()' : process.cwd(),
//     argv: process.argv,
//     __dirname_type: typeof __dirname,
//     __dirname_json: JSON.stringify(__dirname),
//     __filename_type: typeof __filename,
//     __filename_json: JSON.stringify(__filename),
// }, null, 4));
//
// {
//     "process.cwd()": "/Users/sd/Workspace/projects/bash-make-lifecycle/install-test", # where i executed "npx bash-make-lifecycle test"
//     "argv": [
//     "/usr/local/bin/node",
//     "/Users/sd/.npm/_npx/60150/bin/bash-make-lifecycle",
//     "test"
// ],
//     "__dirname_type": "string",
//     "__dirname_json": "\"/Users/sd/.npm/_npx/60150/lib/node_modules/bash-make-lifecycle\"", # where are all files temporary installed
//     "__filename_type": "string",
//     "__filename_json": "\"/Users/sd/.npm/_npx/60150/lib/node_modules/bash-make-lifecycle/install.js\""
// }

const pad = (s, n) => ((s.length < n) ? pad((s)+'0', n) : s);

// const log = (...args) => {
//
//     const d = new Date();
//     const t = parseInt(d.getTime() / 1000, 10) + '.' + pad(d.getMilliseconds(), 3);
//
//     process.stdout.write([t, ': '].concat(...args).join('') + "\n");
// }
const log = (...args) => {

    process.stdout.write([].concat(...args).join('') + "\n");
}

var inquirer = require('inquirer');

const d = (c, reject) => d => new Promise((a, b) => {
    setTimeout(() => {
        log(c);
        setTimeout(() => {
            if (reject) {

                log('reject: ', JSON.stringify(d));

                b(d)
            }
            else {

                log('resolve: ', JSON.stringify(d));

                a(d)
            }
        }, 1000);
    }, 1000);
});

const project = path.resolve(process.cwd());

let file;

function trim(s) {
    return (s || '').replace(/^\s*(\S*(\s+\S+)*)\s*$/,'$1');
}

let fileArg = trim(process.argv[2]);

let contArg = trim(process.argv[3]);

(function again() {

    const fileNotExist = () => {

        if (fileArg) {

            log(`Error: file '${file}' was NOT created`);

            process.exit(1);
        }

        log(`Error: file '${file}' was NOT created, try to input path again:`);

        again();
    }

    let promise;

    // log('so how it gonna be: ');

    if (fileArg) {

        // log('if')

        promise = Promise.resolve({
            file        : fileArg,
            controllers : contArg,
        });
    }
    else {

        // log('else');

        promise = inquirer.prompt([
            {
                type: 'input',
                message: 'Script name',
                default: ('server.js'),
                name: 'file',
                // when: () => false,
                validate: function (file) {

                    const done = this.async();

                    if ( ! file.trim() ) {

                        done(`Field can't be empty`);

                        return;
                    }

                    file = path.resolve(project, file);

                    if ( fs.existsSync(file)) {

                        done(`File '${file}' already exist`);

                        return;
                    }

                    done(null, true);
                }
            },
            {
                type: 'input',
                message: 'Controllers directory name (if none just press enter)',
                name: 'controllers',
            },
        ]);
    }

    promise
        // .then(d('a'), d('b', true))
        .then(answers => {

            file = path.resolve(project, answers.file);

            if ( fs.existsSync(file)) {

                // log('not exist: ', file);

                return Promise.reject(`File '${file}' already exist`);
            }

            prepareDir(path.dirname(file));

            return installTool(path.resolve(__dirname, 'server.js'), file, () => true, {
                "const mkdirP = require('./lib/mkdirp');" : `
var mkdirP = (function () {
    const module = {};
    ${fs.readFileSync(path.resolve(__dirname, 'lib', 'mkdirp.js')).toString()}
    return module.exports;
}())                
                `,
                "'-staticServer-'" : answers.controllers ? `'${answers.controllers}'` : 'false',
            });
        })
        // .then(d('c'), d('d', true))
        .then(() => {

            // log('x')

            if ( fs.existsSync(file)) {

                const package = require(path.resolve(__dirname, 'package.json'));

                log(`npx-server v${package.version}`);

                log(`\nFile '${file}' was created, try now:\n\n    node ${file.substring(project.length + 1)} --help\n`);
            }
            else {

                fileNotExist();
            }

        })
        // .then(d('e'), d('f', true))
        .catch(fileNotExist);
}());



// let project = ((process.argv[2] || 'roderic-project') + '').trim();
//
// if ( ! project ) {
//
//     throw `\n\n    target is not specified, give it in first argument\n\n`;
// }
//
// project = path.resolve(process.cwd(), project);
//
// const package = require(path.resolve(__dirname, '..', 'package.json'));
//
// process.stdout.write(`\n    Installing ${package.name}@${package.version}\n`);

const prepareDir = target => {

    try {

        mkdirP.sync(target);
    }
    catch (e) {

        process.stdout.write(`\n    ERROR prepareDir: ${e}\n`);

        process.exit(1);
    }
};

const installTool = (source, target, filter, replace) => new Promise((resolve, reject) => {

    ncp(source, target, {
        filter: file => {

            const copy = filter(file);

            if ( ! fs.existsSync(file)) {

                throw `file '${file}' doesn't exist`;
            }
            // log(JSON.stringify({
            //     file,
            //     copy
            // }, null, 4))

            return copy;
        }
    }, err => {

        if (err) {

            log('error', (err + ''))

            return reject(`ncp: ${err}`);
        }

        return resolve();
    }, replace);
});

// app
0 && (function () {

    const sourceRoderic = path.resolve(__dirname, '..');

    let list = [
        {
            source: path.resolve(__dirname, '..', 'app'),
            target: path.resolve(project, 'app'),
        },
        {
            source: sourceRoderic,
            target: path.resolve(project, 'react'),
        },
        {
            source: path.resolve(__dirname, '..', 'puppeteer'),
            target: path.resolve(project, 'puppeteer'),
        },
        {
            source: path.resolve(__dirname, '..', 'public'),
            target: path.resolve(project, 'public'),
        },
    ].map(l => {

        l.filter = createIgnoreFilter(
            path.resolve(l.source, '.installgnore'),
            l.source,
        );

        return l;
    });

    list.map(l => prepareDir(l.target));

    const chain = list.map(l => () => installTool(l.source, l.target, l.filter));

    allChain([
        ...chain,
        () => installTool(path.resolve(sourceRoderic, '.env.dist'), path.resolve(project, '.env'), () => true),
    ])
        .then(done => {
            process.stdout.write(`
Project was initialized in directory '${project}', enjoy 🍺

Now run:

    cd "${project}"
    cd react
    yarn add roderic
    
    .. and then:
    
    DEV MODE:
        (cd react && sudo yarn dev)
        
    PROD MODE:
        (cd react && sudo yarn prod && node servers/index.js)        
        
    and optionally tests:    
        (cd puppeteer && /bin/bash test.sh)
        
    
        
    

`);

        }, err => {
            process.stdout.write('error', JSON.stringify(err, null, 4));
        })
    ;

}());


