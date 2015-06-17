'use strict';

var each = require('async').each;
var config = require('./config.js');
var grep = require('./grep.js');

function plugin(options) {
    var cfg = config(options);
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