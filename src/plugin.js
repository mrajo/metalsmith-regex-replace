'use strict';

var config = require('./config.js');
var replace = require('./replace.js');
var each = require('async').each;

function plugin(params) {
  var cfg = config(params);

  return function (files, metalsmith, done) {
  each(
    Object.keys(files),
    function (file, done) {
    files[file].contents = new Buffer(replace(files[file].contents.toString(), cfg));
    done();
    },
    done
  );
  };
}

module.exports = plugin;
