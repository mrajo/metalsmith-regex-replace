'use strict'

const load = require('../src/loader')

const config = (params) => {
  let cfg = false;

  switch (typeof params) {
    case 'object':
      cfg = params
      break
    case 'string':
      cfg = load(params)
      break
    case 'function':
      cfg = params()
  }

  if (!cfg) throw new Error('Invalid arguments')
  return cfg
}

module.exports = config
