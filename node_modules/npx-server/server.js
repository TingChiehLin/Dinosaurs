/**
 * @author Szymon Działowski
 * @date 29 Nov 2017
 * @license MIT
 * @homepage https://github.com/stopsopa/npx-server
 */
var http        = require('http');

var path        = require('path');

var os          = require('os');

var fs          = require('fs');

const spawn      = require('child_process').spawn;

var thisScript = path.basename(__filename);

var script    = 'node ' + thisScript;

var sp = ['node', [thisScript]];

var etag=function(){
    /*!
         * etag
         * Copyright(c) 2014-2016 Douglas Christopher Wilson
         * MIT Licensed
         * https://github.com/jshttp/etag/blob/v1.8.1/index.js
         */
    "use strict";var t=require("crypto"),e=require("fs").Stats,r=Object.prototype.toString;return function(n,i){if(null==n)throw new TypeError("argument entity is required");var o=(u=n,"function"==typeof e&&u instanceof e||u&&"object"==typeof u&&"ctime"in u&&"[object Date]"===r.call(u.ctime)&&"mtime"in u&&"[object Date]"===r.call(u.mtime)&&"ino"in u&&"number"==typeof u.ino&&"size"in u&&"number"==typeof u.size),f=i&&"boolean"==typeof i.weak?i.weak:o;var u;if(!o&&"string"!=typeof n&&!Buffer.isBuffer(n))throw new TypeError("argument entity must be string, Buffer, or fs.Stats");var a,s,c=o?(s=(a=n).mtime.getTime().toString(16),'"'+a.size.toString(16)+"-"+s+'"'):function(e){if(0===e.length)return'"0-2jmj7l5rSw0yVb/vlWAYkK/YBwk"';var r=t.createHash("sha1").update(e,"utf8").digest("base64").substring(0,27);return'"'+("string"==typeof e?Buffer.byteLength(e,"utf8"):e.length).toString(16)+"-"+r+'"'}(n);return f?"W/"+c:c}}();


var staticServer = '-staticServer-';
// var staticServer = false;

let staticServerAbs = false;

if (staticServer) {

    staticServerAbs = path.resolve(__dirname, staticServer);
}

process.on('SIGINT', function (signal) {
    console.log(`signal SIGINT..., signal: ${signal}`)
    process.exit(0);
});
process.on('SIGTERM', function (signal) {
    console.log(`signal SIGTERM..., signal: ${signal}`)
    process.exit(0);
});

const log = function () {
    Array.prototype.slice.call(arguments).map(i => i + "\n").forEach(i => process.stdout.write(i));
};

function isArray(obj) {
    return Object.prototype.toString.call(obj) === '[object Array]';
};
function isObject(a) {
    return Object.prototype.toString.call(a) === '[object Object]';
};

const mkdirP = require('./lib/mkdirp');

/**
 * from https://stackoverflow.com/a/32197381/5560682
 */
const deleteFolderRecursive = function(p) {
    if (fs.existsSync(p)) {
        fs.readdirSync(p).forEach((file, index) => {
            const curPath = path.join(p, file);
            if (fs.lstatSync(curPath).isDirectory()) { // recurse
                deleteFolderRecursive(curPath);
            } else { // delete file
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(p);
    }
};

const restError = (req, res, method, msg) => {

    res.setHeader(`Content-Type`, `application/json; charset=utf-8`);

    res.statusCode = 500;

    return res.end(JSON.stringify({
        method,
        url: req.url,
        msg,
    }));
}

const prepareDir = target => {

    try {

        mkdirP.sync(target);
    }
    catch (e) {

        process.stdout.write(`\n    ERROR prepareDir: ${e}\n`);

        process.exit(1);
    }
};

const raceThrottleDebounce = (function () {

    var crypto = require('crypto');

    return function (fn) {

        var last            = false;

        var triggeredFor    = false;

        var args;

        var newFn = function () {

            last = (new Date()).getTime() + crypto.randomBytes(5).toString('hex');

            args = Array.prototype.slice.call(arguments);

            if (triggeredFor) {

                return ;
            }

            triggeredFor = last;

            return fn.apply(this, args);
        };

        newFn.unlock = function () {

            if (triggeredFor === last) {

                return triggeredFor = last = false;
            }

            triggeredFor = false;

            newFn.apply(this, args);
        };

        return newFn;
    }
}());

const args = (function (obj, tmp) {
    process.argv
        .slice(2)
        .map(a => {

            if (a.indexOf('--') === 0) {

                tmp = a.substring(2).replace(/^\s*(\S*(\s+\S+)*)\s*$/, '$1');

                if (tmp) {

                    obj[tmp] = (typeof obj[tmp] === 'undefined') ? true : obj[tmp];
                }

                return;
            }

            if (a === 'true') {

                a = true
            }

            if (a === 'false') {

                a = false
            }

            if (tmp !== null) {

                if (obj[tmp] === true) {

                    return obj[tmp] = [a];
                }

                try {

                    obj[tmp].push(a);
                }
                catch (e) {

                }
            }
        })
    ;

    Object.keys(obj).map(k => {
        (obj[k] !== true && obj[k].length === 1) && (obj[k] = obj[k][0]);
        (obj[k] === 'false') && (obj[k] = false);
    });

    return {
        all: () => JSON.parse(JSON.stringify(obj)),
        get: (key, def) => {

            var t = JSON.parse(JSON.stringify(obj));

            if (typeof def === 'undefined')

                return t[key];

            return (typeof t[key] === 'undefined') ? def : t[key] ;
        },
        update: data => {

            delete data['config'];

            delete data['dump'];

            delete data['help'];

            delete data['inject'];

            obj = data;
        }
    };
}({}));

const edit = args.get('edit')

// const config = {/*  */}
// const log = console.log;

// // // https://nodejs.org/docs/latest/api/all.html#modules_accessing_the_main_module
// if (require.main === module) {

//     function isObject(a) {
//         return ['[object Object]',"[object Array]"].indexOf(Object.prototype.toString.call(a)) > -1;
//     };

//     const a = process.argv.slice(2);

//     if (a.indexOf('--param') > -1) {

//         const key = ( a[1] || '' ).split('.');

//         let k, tmp = config;

//         while (k = key.shift()) {

//             tmp = tmp[k];
//         }

//         if (isObject(tmp)) {

//             process.stdout.write(JSON.stringify(tmp, null, '    '));
//         }
//         else {

//             process.stdout.write(tmp + '');
//         }

//     }

// }
// else {

//     module.exports = config;
// }

if (args.get('help')) {

    let ssman = '';

    if (staticServer) {

        ssman = `        
    --gc "/path"
    
        generate controller /path in directory '${staticServerAbs}'
`;
    }

    process.stdout.write(`
Standalone static files http server with no dependencies
    
@homepage https://github.com/stopsopa/npx-server
@date 29 Nov 2017
@license MIT    
@author Szymon Działowski https://github.com/stopsopa

parameters:

    --port [port]               def: 8080
    
    --dir [path]                def: '.' 
        relative or absolute path to directory with files to serve
        
    --cache [sec]               60 * 60 * 24 * 365  = 31,536,000
        
    --config [filepath.json]    def: false
    
        path to config file (json format), file can containe object where 
        kays are parameters of this script ('config' param in file will be ignored)        
    
    --noindex                   def: false  
        disable indexing directories content if url points to directory
        
    --log [level]               def: 1
    
        binary mask:
        
            0 - show nothing
            1 - show 404, 
            2 - show 200, 
            4 - show 301
            8 - autoindex
            
            more examples:
                3 - show 404 and 200
                6 - show 200 and 301
                7 - show all without autoindex
                15 - show all
                
    --info
        
        show on top of the page hostname, node version and others
        
    --edit
    
        provide simple files manipulation tools
                
    --watch [regex]            def: false
    
        reload currently opened page in browser when files will change
        
        examples:
            node ${thisScript} --watch                                  - watch all files (can be slow)
            node ${thisScript} --watch '/\\.js$/i'                       - reload only when files with 'js' extension will change
            node ${thisScript} --watch '\\.js$'                          - like above but shorter syntax (if no regex flags)
            node ${thisScript} --watch '/\\.js$/i' --watch '/\\.html$/i'  - reload for 'js' and 'html' files
            node ${thisScript} --watch '/\\.(js|html)$/i'                - like above but in one regex
            
    --ignore [regex]           def: '/^(.*?\\/)?\\.[^\\/]+$/g' (all files starting from ".")
        
        ignore watching files (this param takes precedense over --watch param)
        
        
    --debug [true|false]        def: false
    
        flag for debugging --watch and --ignore parameters behaviour
        
    --dump 
    
        output config        
    ${ssman}
    --flag 
    
        just extra allowed flag for searching processes using 'ps aux | grep [flagvalue]'
    
`);
    process.exit(0);
}

var gc = args.get('gc');

if (staticServer && gc) {

    let file = gc.replace(/[^a-z\d-_]/g, '') + '.js';

    if ( ! file ) {

        process.stdout.write(`Can't generate path from url '${gc}'`);

        process.exit(1);
    }

    let checkPath = gc;

    if (gc.indexOf('/') === 0) {

        checkPath = checkPath.substring(1);
    }

    checkPath = path.resolve(staticServerAbs, checkPath);

    if (fs.existsSync(checkPath)) {

        process.stdout.write(`Error:\n    Can't create controller '${checkPath}' path is already taken`);

        process.exit(1);
    }

    file = path.resolve(staticServerAbs, file);

    prepareDir(path.dirname(file));

    if (fs.existsSync(file)) {

        process.stdout.write(`Error:\n    Controller '${file}' already exist`);

        process.exit(1);
    }

    fs.appendFileSync(file, `
    
// https://nodejs.org/api/http.html#http_class_http_serverresponse
    
const controller = async ({
    req, 
    res, 
    query   = {}, 
    json    = {}, 
    raw
}) => {

    try {

        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        // res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        
        // req.method === 'POST'
    
        // res.statusCode = 404;
    
        res.end(JSON.stringify({
            page: {
                query,
                json,
            },
            raw,
            node: process.version,
        }));
        
        // redirect
        // res.writeHead(302, { "Location": "/index.html?error" });
        // return res.end('');
    }
    catch (e) {
    
        console.log(\`$\{controller.url\} error: $\{e}\`);
        
        res.statusCode = 500;
        
        res.end(\`Server error\`);
    }
}

controller.url = '${gc}';

module.exports = controller;
`);

    if ( fs.existsSync(file) ) {

        process.stdout.write(`Controller '${file}' successfully created`);
    }
    else {

        process.stdout.write(`Error:\n    Controller '${file}' couldn't be created`);

        process.exit(1);
    }

    process.exit(0);
}

var config  = args.get('config');

var dump    = args.get('dump');

if (config) {

    var configData = require(path.resolve(__dirname, config));

    if ( ! isObject(configData) ) {

        throw `data from config file '${config}' should be an object`;
    }

    args.update(Object.assign(configData, args.all()));
}

args.update(args.all());

if (dump) {

    log(JSON.stringify(args.all(), null, '    '));
}

const diff = function(a, b) {
    return a.filter(function(i) {return b.indexOf(i) < 0});
};

(function (d) {
    if (d.length) {

        log(`Unknown parameters: ${d.join(', ')}\ncheck \n\n    node ${thisScript} --help\n\nfor more help`);

        process.exit(1);
    }
}(diff(Object.keys(args.all()), ('port dir noindex log help watch ignore info edit inject debug config dump flag cache' + (staticServer ? ' gc' : '')).split(' '))));

function execArgs (args, str) {
    var arr = ['--inject'];
    Object.keys(args).forEach(key => {
        if (['watch', 'ignore'].indexOf(key) > -1) {

            return;
        }
        if (isArray(args[key])) {
            args[key].forEach(val => {
                arr.push('--' + key)
                arr.push(val)
            });
        }
        else {
            if (args[key] === true) {
                arr.push('--' + key)
            }
            else {
                arr.push('--' + key)
                arr.push(args[key])
            }
        }
    });

    if (str) {

        return arr.map(a => '"' + (a + '').replace(/"/g, '\\"') + '"').join(' ')
    }

    return arr;
}

var dir     = path.resolve(__dirname, args.get('dir', '.'));

var cache   = args.get('cache', false);

if (cache) {

    cache = parseInt(cache, 10);
}

if ( cache < 1 ) {

    cache = false;
}

var regexps = (function () {
    function split(reg) {

        var tmp = reg.substring(1).match(/^(.*)\/([^\/]*)$/);

        if (tmp) {

            return tmp.slice(1);
        }

        return [reg];
    }
    return function (list, debug) {
        return list.filter(i => (typeof i === 'string')).filter(i => i.replace(/^\s*(\S*(\s+\S+)*)\s*$/, '$1')).map(i => {
            if (i[0] === '/') {
                i = split(i);
                return new RegExp(i[0], i[1]);
            }
            return new RegExp(i);
        });

    }
}());

var debug   = args.get('debug');

var ignore  = args.get('ignore', '/^\\./');

if (ignore === true) {

    ignore = false;
}
else {

    if ( ! isArray(ignore)) {
        ignore = [ignore];
    }

    ignore = regexps(ignore).filter(i => i);

    if (ignore.length === 0) {

        ignore = false;
    }
}

var watch   = args.get('watch', false);

if (typeof watch !== 'boolean') {

    if ( ! isArray(watch) ) {

        watch = [watch];
    }

    watch = regexps(watch);

    if (watch.length === 0) {

        watch = true;
    }
}

script += ' ' + execArgs(args.all(), true);

sp[1] = sp[1].concat(execArgs(args.all()));

if (watch) {

    var child;

    var event = raceThrottleDebounce(function (eventType, filename) {

        debug && log('try: ' + filename);

        if (filename) {

            if (isArray(ignore)) {

                for (var i = 0, l = ignore.length ; i < l ; i += 1 ) {

                    debug && log(`before test (ignore): /${ignore[i].source}/${ignore[i].flags} against: `+ filename);

                    if (ignore[i].test(filename)) {

                        debug && log(`ignored: /${ignore[i].source}/${ignore[i].flags} `+ filename);

                        return event.unlock();
                    }
                }
            }

            if (isArray(watch)) {

                for (var matched = false, i = 0, l = watch.length ; i < l ; i += 1 ) {

                    debug && log(`before test (watch): /${watch[i].source}/${watch[i].flags} against: `+ filename);

                    if (watch[i].test(filename)) {

                        debug && log(`matched: /${watch[i].source}/${watch[i].flags} `+ filename);

                        matched = true;

                        break;
                    }
                }

                if ( ! matched ) {

                    return event.unlock();
                }
            }
        }

        if (child) {

            log(eventType + ': ' + filename + ', restarting process: ' + script);

            child.kill();
        }

        child = spawn(sp[0], sp[1]);

        child.stdout.on('data', (data) => process.stdout.write(data));

        event.unlock();
    });

    event();

    fs.watch(dir, {
        recursive: true
    }, event);
}
else {

    var port    = parseInt(args.get('port', 8080), 10);

    var logs    = parseInt(args.get('log', 1), 10);

    var inject   = args.get('inject');

    var type = (function (types) {
        return function (req, res, ext) {

            ext = ext || path.extname(req.url.toLowerCase().split('?')[0]).replace(/[^a-z0-9]/g, '');

            types[ext] && res.setHeader('Content-Type', types[ext]);

            return ext;
        }
    }((function (type) {
        type.jpeg = type.jpg;
        type.log  = type.txt;
        return type;
    }({
        html    : 'text/html; charset=utf-8',
        js      : 'application/javascript; charset=utf-8',
        css     : 'text/css; charset=utf-8',
        json    : 'application/json; charset=utf-8',
        txt     : 'text/plain; charset=utf-8',
        gif     : 'image/gif',
        bmp     : 'image/bmp',
        jpg     : 'image/jpeg',
        png     : 'image/png',
        pdf     : 'application/pdf',
        svg     : 'image/svg+xml',
        ico     : 'image/x-icon',
    }))));

    function time() {
        return (new Date()).toISOString().substring(0, 19).replace('T', ' ');
    }

    var server = http.createServer().listen(port);

    function noAccess(req, res, isDir, notype) {

        res.statusCode = 403;

        type(req, res, 'html');

        (logs & 2) && log(`${time()} \x1b[35m${res.statusCode}\x1b[0m: ${req.url}`);

        res.end(`<div style="color: #92317B; font-family: tahoma;">${notype ? '' : (isDir ? 'directory' : 'file')} ${req.url} no access.</div>`);
    }

    var uniq = (function unique(pattern) {
        return pattern.replace(/[xy]/g,
            function(c) {
                var r = Math.random() * 16 | 0,
                    v = c == 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
    }('xyxyxyxyxyxyx'));

    function addWatcher(content, ext) {

        if (inject && ext === 'html') {

            content = content.replace(
                /(<\s*\/\s*body\s*>)/i,
                `<script>(function run(uniq){fetch('?watch='+uniq).then(res=>res.text()).then(hash=>run(hash),()=>(function test(){return fetch(location.href).then(()=>location.href=location.href,()=>setTimeout(test,500))}()))}('${uniq}'))</script>$1`
            );
        }

        return content;
    }

    const controllers = () => {

        const dir = path.resolve(__dirname, staticServer);

        if ( ! fs.existsSync(dir) ) {

            return [];
        }

        return fs.readdirSync(dir)
            .reduce((acc, file) => {

                const lib = path.resolve(dir, file);

                try {

                    const ext = path.extname(file);

                    const isDir = fs.lstatSync(lib).isDirectory();

                    if ( isDir ) {

                        return acc;
                    }

                    const content = fs.readFileSync(lib, 'utf8').toString();

                    if (ext !== '.js' || !content.includes('module.exports = controller;')) {

                        return acc;
                    };

                    delete require.cache[lib];

                    const module = require(lib);

                    module.__file = lib;

                    acc.push(module);
                }
                catch (e) {

                    log(`controllers error [${lib}]: `, e)
                }

                return acc;
            }, [])
        ;
    }

    // base64 online encoder: https://xaviesteve.com//pro/base64.php
    const favicon = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAgY0hSTQAAeiYAAICEAAD6AAAAgOgAAHUwAADqYAAAOpgAABdwnLpRPAAAAFdQTFRF/////v7+7e3t4+Pj4uLi7u7urKysSEhINjY2SUlJtLS0GhoaMzMzysrK5OTkODg4S0tLHR0duLi4MjIySkpK5eXl7+/vHBwc8/PzbGxsNTU18fHx7u/vzVzHUQAAAAFiS0dEAIgFHUgAAAAJcEhZcwAAFiUAABYlAUlSJPAAAADdSURBVDjLnZPZEoMgDEWBQAVF0Nq9/f/vbBAXNnXa++KMOQPJMRIShi4h8XsGLlxQj5AUOFVyjKpJMaxqtKvrRrEiAFK3BsC0WsIG4Avz8x/g4AqhsElrsclO5FU3ca2k7nstu3Oh7JxQhsfjNYKWgKjRySks6GJ1AjKnCSAypwGAPZh2SAZePxxYnAJnsbGyX4DDK3yTl7nJySlNPaDTMbPTDKDCXDHmFojaBbITCiajpRHb27kxZgjcS6LWPJ4vuQuQN7ijh4Pt/KQms6Qms/WljHPuf+O8XvjtMV9rxg4RtlXOXgAAACV0RVh0ZGF0ZTpjcmVhdGUAMjAxOC0xMS0yN1QxMDowMzowMSswMDowMIg1+6IAAAAldEVYdGRhdGU6bW9kaWZ5ADIwMTgtMTEtMjdUMTA6MDM6MDErMDA6MDD5aEMeAAAARnRFWHRzb2Z0d2FyZQBJbWFnZU1hZ2ljayA2LjcuOC05IDIwMTQtMDUtMTIgUTE2IGh0dHA6Ly93d3cuaW1hZ2VtYWdpY2sub3Jn3IbtAAAAABh0RVh0VGh1bWI6OkRvY3VtZW50OjpQYWdlcwAxp/+7LwAAABh0RVh0VGh1bWI6OkltYWdlOjpoZWlnaHQAMTkyDwByhQAAABd0RVh0VGh1bWI6OkltYWdlOjpXaWR0aAAxOTLTrCEIAAAAGXRFWHRUaHVtYjo6TWltZXR5cGUAaW1hZ2UvcG5nP7JWTgAAABd0RVh0VGh1bWI6Ok1UaW1lADE1NDMzMTI5ODEv0kVFAAAAD3RFWHRUaHVtYjo6U2l6ZQAwQkKUoj7sAAAAVnRFWHRUaHVtYjo6VVJJAGZpbGU6Ly8vbW50bG9nL2Zhdmljb25zLzIwMTgtMTEtMjcvNzMzODU0Y2FjM2I1MGI4NGE3NmIwODY1MmY4NDdjYjQuaWNvLnBuZwnzw3IAAAAASUVORK5CYII=', 'base64');

    server.on('request', function (req, res) {

        var method = req.method.toUpperCase();

        var url = req.url.split('?')[0];

        if (url === '/favicon.ico') {

            (logs & 4) && log(`${time()} \x1b[33m${res.statusCode}\x1b[0m: ${url}`);

            res.statusCode = 200;
            res.setHeader('Content-Type', 'image/x-icon');
            res.setHeader("Cache-Control", "public, max-age=2592000");                // expiers after a month
            res.setHeader("Expires", new Date(Date.now() + 2592000000).toUTCString());
            return res.end(favicon);
        }

        if (url === '/run-sandbox-server.sh-check') {

            res.statusCode = 201;

            return res.end('ok')
        }

        if (inject) {

            var test = req.url.match(/\?watch=(.*)/);

            if (test) {

                if (test[1] !== uniq) {

                    return res.end(uniq)
                }

                return;
            }
        }

        // (function (a) {
        //     if (url.indexOf(a) === 0) {
        //         url = url.substring(a.length);
        //     }
        // }('/app_dev.php'));

        var query = req.url.split('?')[1];

        if (typeof query === 'string') {

            query = query.split('&').reduce((acc, val) => {
                var
                    a       = val.split(/=/),
                    key     = a.shift(),
                    dec     = a.join('=')
                ;
                if (key) {

                    acc[key] = decodeURIComponent(dec);
                }

                return acc;
            }, {});

            if (typeof query._redirect === 'string') {

                res.writeHead(query._status || 301, { 'Location': query._redirect });

                return setTimeout(() => res.end(), query._timeout ? (parseInt(query._timeout, 10) || 0) : 0);
            }
        }

        var file = path.resolve(dir, '.' + path.sep + (decodeURI(url).replace(/\.\.+/g, '.')));

        if (fs.existsSync(file)) {

            var isDir = fs.statSync(file).isDirectory();

            if (edit) {

                // fetch('test.txt', {
                //     method: 'PATCH', // must be uppercase, I'm not entirely sure why
                //     body: JSON.stringify({
                //         new: '/pvc/te.txt' // must be absolute path from web dir.. for now @todo - maybe it shouldn't be?
                //     })
                // })

                if (method === 'PATCH') {

                    let json='';
                    req.setEncoding('utf8');
                    req.on('data', function(chunk) {
                        json += chunk;
                    });

                    return req.on('end', function() {

                        try {

                            json = JSON.parse(json);

                        } catch (e) {

                            json = e;
                        }

                        if ( typeof json.new !== 'string' ) {

                            log(`${time()} PATCH (RENAME): \x1b[31mCan't rename\x1b[0m ${file}`);

                            return restError(req, res,'PATCH', `Can't rename '${file}' because new name was not given`);
                        }

                        try {

                            var n;


                            if (json.new.substring(0, 1) === '/') {

                                n = path.resolve(dir, '.' + path.sep + (decodeURI(json.new).replace(/\.\.+/g, '.')));
                            }
                            else {

                                n = path.resolve(path.dirname(file), '.' + path.sep + (decodeURI(json.new).replace(/\.\.+/g, '.')));
                            }
                            
                            log(`${time()} PATCH (RENAME): ${file} -> ${n}`);

                            if ( fs.existsSync(n) ) {

                                return restError(req, res,'PATCH', `Can't rename '${file}' to ${n} because under new name already exist something`);
                            }

                            prepareDir(path.dirname(n));

                            if ( ! fs.existsSync(dir) ) {

                                return restError(req, res, 'POST', `Can't create directory '${dir}' - POST create file mode, ${file}`);
                            }

                            fs.renameSync(file, n);

                            if ( ! fs.existsSync(n) ) {

                                return restError(req, res,'PATCH', `Renaming '${file}' to ${n} failed`);
                            }

                            res.setHeader(`Content-Type`, `application/json; charset=utf-8`);

                            return res.end(JSON.stringify({
                                patch: true,
                            }));
                        }
                        catch (e) {

                            res.setHeader(`Content-Type`, `application/json; charset=utf-8`);

                            res.statusCode = 500;

                            res.end(JSON.stringify({
                                exception: 'PATCH error',
                                file,
                                json,
                                exceptionMessage: e.message,
                                exceptionMessageSplit: (e.message + '').split("\n")
                            }));
                        }
                    });
                }

                if (method === 'POST') {

                    log(`${time()} POST (CREATE): \x1b[31mCan't create\x1b[0m: ${file}`);

                    return restError(req, res, 'POST',`Can't create file '${file}' because it already exist`);
                }

                if (method === 'PUT') {

                    // fetch('/file.txt', {
                    //     method: 'put',
                    //     body: JSON.stringify({data: 'data...'})
                    // }).then(req => req.json()).then(json => console.log(json))

                    if (isDir) {

                        return restError(req, res, 'PUT',`directory '${file}' already exist`);
                    }

                    fs.unlinkSync(file);

                    if (fs.existsSync(file)) {

                        return restError(req, res, 'PUT',`can't remove file '${file}'`);
                    }

                    let json='';
                    req.setEncoding('utf8');
                    req.on('data', function(chunk) {
                        json += chunk;
                    });

                    log(`${time()} PUT (EDIT): ${file}`);

                    return req.on('end', function() {

                        const raw = json;

                        try {

                            json = JSON.parse(json);

                        } catch (e) {

                            json = e;
                        }

                        try {

                            fs.appendFileSync(file, json.data || '');

                            if ( ! fs.existsSync(file) ) {

                                return restError(req, res, 'PUT',`can't create file '${file}'`);
                            }

                            res.setHeader(`Content-Type`, `application/json; charset=utf-8`);

                            return res.end(JSON.stringify({
                                put: true,
                            }));
                        }
                        catch (e) {

                            res.setHeader(`Content-Type`, `application/json; charset=utf-8`);

                            res.statusCode = 500;

                            res.end(JSON.stringify({
                                exception: 'PUT error',
                                file,
                                json,
                                exceptionMessage: e.message,
                                exceptionMessageSplit: (e.message + '').split("\n")
                            }));
                        }
                    });
                }

                if (method === 'DELETE') {

                    log(`${time()} DELETE: ${file}`);

                    isDir ? deleteFolderRecursive(file) : fs.unlinkSync(file);

                    res.setHeader(`Content-Type`, `application/json; charset=utf-8`);

                    return res.end(JSON.stringify({
                        delete: true,
                    }));
                }
            }

            if (isDir) {

                if (args.get('noindex')) {

                    return noAccess(req, res, isDir, true);
                }

                if (url.length > 1 && url.substr(-1) !== '/') {

                    res.writeHead(302, { 'Location': url + '/' });

                    (logs & 4) && log(`${time()} \x1b[33m${res.statusCode}\x1b[0m: ${url} -> ${url + '/'}`);

                    return res.end();
                }

                try {

                    var info = '';

                    if (args.get('info')) {

                        info = `
<style>
    .env-c {
        display: none;
        position: absolute; 
        top: 44px; 
        left: 10px; 
        border: 1px solid gray; 
        background-color: white; 
        padding: 5px;
        max-height: 80%;
        min-width: 30%;
        overflow-y: scroll;
    }
    .env-c pre {
        margin: 0;
        font-size: 16px;
        font-family: monospace;
    }
    .env-c.visible {
        display: inline-block;
    }
</style>
<script>
    var log = (function(){try{return console.log}catch(e){return function(){}}}());
    document.addEventListener('DOMContentLoaded', function () {
       var p = document.querySelector('.env-p'); 
       var c = document.querySelector('.env-c');
       p.addEventListener('click', function () {
           c.classList.toggle("visible");
       });
    });
</script>
<button class="env-p" onClick=>ENV</button>
<div class="env-c"><pre>${JSON.stringify(process.env, null, 4)}</pre></div>
hostname: ${os.hostname()}, node: ${process.version}
<hr>
`
                    }

                    var list = `
<!doctype html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <link rel="shortcut icon" href="/favicon.ico" type="image/x-icon">
    <link rel="icon" href="/favicon.ico" type="image/x-icon">
</head>
<body>
    <style>
        *{font-family:tahoma;font-size:12px}
        ul{padding:0;list-style-type:none}
        a{padding-right:20px;padding-left:3px;margin-left:3px;border-left:1px solid transparent}
        a:hover{border-left:1px solid gray}
    </style>
    ${info}
    <ul><li>📁<a href=".."> .. </a></li>
</body>
</html>
    `;
                    list += fs.readdirSync(file).map(f => {
                        var dir = fs.statSync(path.resolve(file, f)).isDirectory();
                        return `<li>${dir?'📁':'📄'}<a href="./${f}${dir?'/':''}">${f}</a></li>`;
                    }).join("\n");

                    list += '</ul>';
                }
                catch (e) {

                    return noAccess(req, res, isDir);
                }

                (logs & 8) && log(`${time()} \x1b[36m${res.statusCode}\x1b[0m: [\x1b[36mautoindex\x1b[0m] ${req.url}`);

                return res.end(addWatcher(list, type(req, res, 'html')));
            }

            try {

                const content = fs.readFileSync(file);

                if (cache) {

                    // Cache-Control: public, max-age=30758400
                    res.setHeader(`Cache-Control`, `public, max-age=${cache}`);

                    // ETag: W/"41981-16316f3a346"
                    // res.setHeader(`ETag`, `public, max-age=${cache}`);
                    res.setHeader(`ETag`, etag(content, {
                        weak: true
                    })); // 60 * 60 * 24 * 365  = 31,536,000

                    // Last-Modified: Mon, 30 Apr 2018 14:27:35 GMT
                    var stats = fs.statSync(file);
                    var mtime = stats.mtime;
                    res.setHeader(`Last-Modified`, mtime.toUTCString());
                }

                res.end(addWatcher(content, type(req, res)));
            }
            catch (e) {

                return noAccess(req, res, isDir);
            }

            (logs & 2) && log(`${time()} \x1b[32m${res.statusCode}\x1b[0m: ${req.url}`);
        }
        else {

            let found = false;

            if (staticServer) {

                found = controllers().find(c => c.url === url);
            }

            if (found) {

                let json='';
                req.setEncoding('utf8');
                req.on('data', function(chunk) {
                    json += chunk;
                });

                req.on('end', function() {

                    const raw = json;

                    try {

                        json = JSON.parse(json);

                    } catch (e) {

                        json = e;
                    }

                    try {

                        found({ req, res, query, json, raw });
                    }
                    catch (e) {

                        res.setHeader(`Content-Type`, `application/json; charset=utf-8`);

                        res.statusCode = 500;

                        res.end(JSON.stringify({
                            exception: 'General controller exception',
                            controller: found.__file,
                            exceptionMessage: e.message,
                            exceptionMessageSplit: (e.message + '').split("\n")
                        }));
                    }
                });

                (logs & 1) && log(`${time()} \x1b[93m${res.statusCode}\x1b[0m: ${req.url}`);
            }
            else {

                if (edit) {

                    if (method === 'DELETE') {

                        log(`${time()} DELETE: \x1b[31mDoesn't exist\x1b[0m: ${file}`);

                        return restError(req, res,'DELETE', `Can't delete '${file}' because it doesn't exist`);
                    }

                    if (method === 'PATCH') {

                        log(`${time()} PATCH (RENAME): \x1b[31mDoesn't exist\x1b[0m: ${file}`);

                        return restError(req, res,'PATCH', `Can't rename '${file}' because it doesn't exist`);
                    }

                    if (method === 'PUT') {

                        log(`${time()} PUT (EDIT): \x1b[31mCan't update\x1b[0m: ${file}`);

                        return restError(req, res,'PUT', `Can't update '${file}' because it doesn't exist`);
                    }

                    if (method === 'POST') {

                        let json='';
                        req.setEncoding('utf8');
                        req.on('data', function(chunk) {
                            json += chunk;
                        });

                        req.on('end', function() {

                            try {

                                json = JSON.parse(json);

                            } catch (e) {

                                json = e;
                            }

                            if (json.dir) {

                                // fetch('/dire/ctory', {
                                //     method: 'post',
                                //     body: JSON.stringify({dir: true})
                                // }).then(req => req.json()).then(json => console.log(json))

                                log(`${time()} POST (CREATE): dir mode: ${file}`);

                                try {

                                    mkdirP.sync(file);

                                    if ( ! fs.existsSync(file) ) {

                                        return restError(req, res, 'POST', `Can't create directory '${file}', unknown reason`);
                                    }

                                    var isDir = fs.statSync(file).isDirectory();

                                    if ( ! isDir ) {

                                        return restError(req, res, 'POST', `Path '${file}' is not a directory`);
                                    }

                                    res.setHeader(`Content-Type`, `application/json; charset=utf-8`);

                                    return res.end(JSON.stringify({
                                        post: true,
                                        dirMode: true,
                                    }));
                                }
                                catch (e) {

                                    return restError(req, res, 'POST', `Can't create directory '${file}', reason: ${e}`);
                                }
                            }

                            log(`${time()} POST (CREATE): file mode: ${file}`);

                            try {

                                // fetch('/dire/ctory/a/b/c/dfile.txt', {
                                //     method: 'post',
                                //     body: JSON.stringify({data: 'my data'})
                                // }).then(req => req.json()).then(json => console.log(json))

                                const dir = path.dirname(file);

                                prepareDir(dir);

                                if ( ! fs.existsSync(dir) ) {

                                    return restError(req, res, 'POST', `Can't create directory '${dir}' - POST create file mode, ${file}`);
                                }

                                var isDir = fs.statSync(dir).isDirectory();

                                if ( ! isDir ) {

                                    return restError(req, res, 'POST', `Path '${file}' is not a directory 2`);
                                }

                                if ( fs.existsSync(file) ) {

                                    return restError(req, res, 'POST', `Path '${file}' already exist`);
                                }

                                fs.appendFileSync(file, json.data || '');

                                if ( ! fs.existsSync(file) ) {

                                    return restError(req, res, 'POST',`can't create file '${file}'`);
                                }

                                res.setHeader(`Content-Type`, `application/json; charset=utf-8`);

                                return res.end(JSON.stringify({
                                    post: true,
                                }));
                            }
                            catch (e) {

                                res.setHeader(`Content-Type`, `application/json; charset=utf-8`);

                                res.statusCode = 500;

                                return res.end(JSON.stringify({
                                    post: true,
                                    dirMode: false,
                                    url,
                                    json,
                                    query,
                                    method,
                                    exceptionMessage: e.message,
                                    exceptionMessageSplit: (e.message + '').split("\n")
                                }));
                            }
                        });

                        return;
                    }

                    res.setHeader(`Content-Type`, `application/json; charset=utf-8`);

                    res.statusCode = 500;

                    return res.end(JSON.stringify({
                        exception: 'edit endpoint',
                        query,
                        method,
                        error: 'unknown method',
                    }));
                }
                else {

                    res.statusCode = 404;

                    res.end(`<div style="color: #b10000; font-family: tahoma;">status code ${res.statusCode}: ${req.url}</div>`);

                    (logs & 1) && log(`${time()} \x1b[31m${res.statusCode}\x1b[0m: ${req.url}`);
                }
            }
        }
    });

    log(`
         🌎  Listening on port ${port}, start time: ${time()}
            serving files from directory ${dir}, --help for more info
    `);

}
