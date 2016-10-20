'use strict'

// Internal object for performing search and replace.

const is = require('is')
if (!Object.assign) Object.assign = require('object-assign')

const replace = (text, config) => {
  const defaults = {
    caseSensitive: false,
    matchCase: true,
    isolatedWord: true,
    bypass: '|'
  }

  const initOptions = (options, base) => {
    if ('undefined' == typeof base) base = defaults
    options = Object.assign(base, options)
    let flags = 'g'

    if (!options['caseSensitive']) flags += 'i'

    if (options['bypass'].length > 1) {
      throw new Error('bypass option needs to be a one-character string')
    }

    return {
      options: options,
      flags: flags
    }
  }

  const subs = config['subs']

  // global options and flags
  const _options = initOptions(config['options'])
  const g_options = _options.options
  const g_flags = _options.flags

  // substitute
  subs.forEach((sub, index) => {
    if (is.regexp(sub['search'])) {
      text = text.replace(sub['search'], sub['replace'])
    } else {
      // per-match options and flags
      const _options = initOptions(sub['options'], g_options)
      const m_options = _options.options
      const m_flags = _options.flags
      let regexp;

      if (m_options['isolatedWord']) {
        regexp = new RegExp('\\b(?!\\' + g_options['bypass'] + ')(' + sub['search'] + ')(?!\\' + g_options['bypass'] + ')\\b', m_flags)
      } else {
        regexp = new RegExp('(?!\\' + g_options['bypass'] + ')(' + sub['search'] + ')(?!\\' + g_options['bypass'] + ')', m_flags)
      }

      // check if replace doesn't contain backreferences, then match original case if possible
      if (/\$/.test(sub['replace']) || !m_options['matchCase']) {
        text = text.replace(regexp, (...args) => {
          args = Array.prototype.slice.call(args)

          // if more than 4 args, then there are more than 1 backreferences
          // search and replace for JS backreferences (i.e. $2, $3, etc.) and
          // replace them with argument values for submatches
          if (args.length > 4) {
            let replacement_text = sub['replace']
            for (let i = 2; i < args.length - 1; i++) {
              replacement_text = replacement_text.replace('$' + i, args[i])
            }
            return replacement_text
          }
          // a regular replacement
          if (args[1]) {
            return sub['replace']
          }
          // bypassed
          else {
            return args[0]
          }
        })
      } else {
        text = text.replace(regexp, (match, p1) => {
          if (p1) {
            // all caps if original was all caps
            if (p1 === p1.toUpperCase()) {
              return sub['replace'].toUpperCase()
            }
            // capitalize if original was capitalized
            else if (p1[0] === p1[0].toUpperCase()) {
              return sub['replace'].charAt(0).toUpperCase() + sub['replace'].slice(1)
            }

            return sub['replace'].toLowerCase()
          } else {
            return match
          }
        })
      }
    }
  })

  // remove bypass brackets
  const re_bypass = new RegExp('\\' + g_options['bypass'] + '(.+?)' + '\\' + g_options['bypass'], 'ig')
  text = text.replace(re_bypass, '$1')

  return text
}


module.exports = replace
