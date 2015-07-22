'use strict';

/**
 Internal object for performing search and replace.
 This is not a port or implementation of grep.
**/

var extend = require('extend');
var is = require('is');
var rot = require('rot');

/** NOTES
    To allow for search terms to bypass substitution, bracket it with vertical pipes (|word|)

    This makes the regexp replacements more complicated, because trying to regexp
    for "\b[^|](target)[^|]\b" causes it to ruin the word boundary checks.

    To perform the substitution:
        1. convert |target| into |rot13(target)| to make it pass through actual substitution
        2. substitute /\b(target)\b/
        3. convert |rot13(target)| to target
**/
var grep = function (text, config) {
    var defaults = {
        caseSensitive: false,
        matchCase: true,
        isolatedWord: true,
        bypass: '|'
    };

    function initOptions(options, base) {
        if ('undefined' == typeof base) base = defaults;
        var options = extend(base, options);
        var flags = 'g';

        if (!options['caseSensitive']) flags += 'i';

        if (options['bypass'].length > 1) {
            throw new Error('bypass option needs to be a one-character string');
        }

        return {
            options: options,
            flags: flags
        };
    }

    var subs = config['subs'];

    // global options and flags
    var _options = initOptions(config['options']);
    var g_options = _options.options;
    var g_flags = _options.flags;

    // preserve bypassed words
    if ('string' == typeof g_options['bypass']) {
        // regex for words enclosed in vertical pipes
        var re_bypass = new RegExp('[' + g_options['bypass'] + '](.+?)[' + g_options['bypass'] + ']', g_flags);

        text = text.replace(re_bypass, function (match, p1) { return g_options['bypass'] + rot(p1) + g_options['bypass']; });
    }

    // substitute
    subs.forEach(function (sub, index) {
        if (is.regexp(sub['search'])) {
            text = text.replace(sub['search'], sub['replace']);
        } else {
            // per-match options and flags
            var _options = initOptions(sub['options'], g_options);
            var m_options = _options.options;
            var m_flags = _options.flags;

            if (m_options['isolatedWord']) {
                var regexp = new RegExp('\\b(' + sub['search'] + ')\\b', m_flags);
            } else {
                var regexp = new RegExp('(' + sub['search'] + ')', m_flags);
            }

            // check if replace contains backreferences
            if (/\$/.test(sub['replace']) || !m_options['matchCase']) {
                text = text.replace(regexp, sub['replace']);
            } else {
                text = text.replace(regexp, function (match, p1) {
                    // all caps if original was all caps
                    if (p1 === p1.toUpperCase()) {
                        return sub['replace'].toUpperCase();
                    }
                    // capitalize if original was capitalized
                    else if (p1[0] === p1[0].toUpperCase()) {
                        return sub['replace'].charAt(0).toUpperCase() + sub['replace'].slice(1);
                    }

                    return sub['replace'].toLowerCase();
                });
            }
        }
    });

    // restore bypassed words
    if ('string' == typeof g_options['bypass']) {
        text = text.replace(re_bypass, function (match, p1) { return rot(p1); });
    }

    return text;
};


module.exports = grep;
