'use strict'

const load = require('../src/loader.js')

const config = (params) => {
  let cfg = false;

  switch (typeof params) {
    case 'object':
      cfg = params
      break
    case 'string':
      if (/\.ya?ml$/.test(params)) cfg = load.yaml(params)
      if (/\.json$/.test(params))  cfg = load.json(params)
      break
    case 'function':
      cfg = params()
  }

  if (!cfg) throw new Error('Invalid arguments')
  return cfg
}

module.exports = config
