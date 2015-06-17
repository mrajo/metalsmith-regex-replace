'use strict';

var load = require('../src/loader.js');

function config(params) {
    var cfg = false;
    if ('object' == typeof params) cfg = params;
    if ('string' == typeof params && (params.endsWith('.yaml') || params.endsWith('.yml'))) cfg = load.yaml(params);
    if ('string' == typeof params && params.endsWith('.json')) cfg = load.json(params);
    if ('function' == typeof params) cfg = params();
    if (!cfg) throw new Error('Invalid arguments');
    return cfg;
}

module.exports = config;