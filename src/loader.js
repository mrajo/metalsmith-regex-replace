'use strict'

const yaml = require('js-yaml')
const fs = require('fs')

const loadConfig = (filepath) => {
  try {
    const contents = fs.readFileSync(filepath, 'utf8')
    if (/\.ya?ml$/.test(filepath)) return yaml.safeLoad(contents)
    if (/\.json$/.test(filepath))  return JSON.parse(contents)
    throw new Error() // path pointed to a non-JSON/non-YAML file
  } catch (e) {
    throw new Error('Invalid config')
  }
}

module.exports = loadConfig
