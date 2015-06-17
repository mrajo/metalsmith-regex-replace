'use strict';

var yaml = require('../lib/yaml_loader.js');

function config(options) {
    var subs = false;
    if ('object' == typeof options) subs = options;
    if ('string' == typeof options) subs = yaml(options);
    if ('function' == typeof options) subs = options();
    if (!subs) throw new Error('"subs" option required');
    return subs;
}

module.exports = config;