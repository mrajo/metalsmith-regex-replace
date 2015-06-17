'use strict';

var yaml = require('js-yaml');
var fs = require('fs');

function loadyaml(filepath) {
    try {
        return yaml.safeLoad(fs.readFileSync(filepath, 'utf8'));
    } catch (e) {
        console.error(e);
    }
}

function loadjson(filepath) {
    try {
        return JSON.parse(fs.readFileSync(filepath, 'utf8'));
    } catch (e) {
        console.error(e);
    }
}

module.exports = {
    yaml: loadyaml,
    json: loadjson
};