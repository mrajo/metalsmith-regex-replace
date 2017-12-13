'use strict'

const yaml = require('js-yaml')
const fs = require('fs')

const loadYaml = (filepath) => {
  try {
    return yaml.safeLoad(fs.readFileSync(filepath, 'utf8'))
  } catch (e) {
    console.error(e)
  }
  return false
}

const loadJson = (filepath) => {
  try {
    return JSON.parse(fs.readFileSync(filepath, 'utf8'))
  } catch (e) {
    console.error(e)
  }
  return false
}

const loadConfig = (filepath) => {
  if (/\.ya?ml$/.test(filepath)) return loadYaml(filepath)
  if (/\.json$/.test(filepath))  return loadJson(filepath)
  return false
}

module.exports = loadConfig
