'use strict'

const load = require('../src/loader.js')

const config = (params) => {
  let cfg = false;
  if ('object' == typeof params) cfg = params
  if ('string' == typeof params && /\.ya?ml$/.test(params)) cfg = load.yaml(params)
  if ('string' == typeof params && /\.json$/.test(params)) cfg = load.json(params)
  if ('function' == typeof params) cfg = params()
  if (!cfg) throw new Error('Invalid arguments')
  return cfg
}

module.exports = config
