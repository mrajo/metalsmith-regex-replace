'use strict';

var yaml = require('js-yaml');
var fs = require('fs');

function loadyaml(filepath) {
    try {
        var doc = yaml.safeLoad(fs.readFileSync(filepath, 'utf8'));
        return doc;
    } catch (e) {
        console.error(e);
    }
}

module.exports = loadyaml;