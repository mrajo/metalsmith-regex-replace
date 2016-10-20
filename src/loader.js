'use strict'

const yaml = require('js-yaml')
const fs = require('fs')

let loader = module.exports = {}

loader.yaml = (filepath) => {
  try {
    return yaml.safeLoad(fs.readFileSync(filepath, 'utf8'))
  } catch (e) {
    console.error(e)
  }
  return false
}

loader.json = (filepath) => {
  try {
    return JSON.parse(fs.readFileSync(filepath, 'utf8'))
  } catch (e) {
    console.error(e)
  }
  return false
}
