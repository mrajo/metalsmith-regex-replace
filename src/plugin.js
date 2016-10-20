'use strict'

const config = require('./config.js')
const replace = require('./replace.js')
const each = require('async').each

const plugin = (params) => {
  const cfg = config(params)

  return (files, metalsmith, done) => {
    each(
      Object.keys(files),
      (file, done) => {
        files[file].contents = new Buffer(replace(files[file].contents.toString(), cfg))
        done()
      },
      done
    )
  }
}

module.exports = plugin
