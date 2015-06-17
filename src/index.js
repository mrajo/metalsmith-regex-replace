'use strict';

var config = require('./config.js');
var grep = require('./grep.js');
var each = require('async').each;

function plugin(params) {
    var cfg = config(params);
    var subs = cfg['subs'];

    return function (files, metalsmith, done) {
        each(
            Object.keys(files),
            function (file, done) {
                files[file].contents = new Buffer(grep(files[file].contents.toString(), subs));
                done();
            },
            done
        );
    };
}

module.exports = plugin;