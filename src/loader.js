'use strict';

var yaml = require('js-yaml');
var fs = require('fs');

var loader = module.exports = {};

loader.yaml = function (filepath) {
  try {
    return yaml.safeLoad(fs.readFileSync(filepath, 'utf8'));
  } catch (e) {
    console.error(e);
  }
  return false;
};

loader.json = function (filepath) {
  try {
    return JSON.parse(fs.readFileSync(filepath, 'utf8'));
  } catch (e) {
    console.error(e);
  }
  return false;
};
