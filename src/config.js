'use strict';

var load = require('../src/loader.js');

function config(options) {
    var subs = false;
    if ('object' == typeof options) subs = options;
    if ('string' == typeof options && (options.endsWith('.yaml') || options.endsWith('.yml'))) subs = load.yaml(options);
    if ('string' == typeof options && options.endsWith('.json')) subs = load.json(options);
    if ('function' == typeof options) subs = options();
    if (!subs) throw new Error('"subs" option required');
    return subs;
}

module.exports = config;