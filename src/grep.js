'use strict';

/**
 Internal object for performing search and replace.
 This is not a port or implementation of grep.
**/

var extend = require('extend');
var is = require('is');
var rot = require('rot');

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
                var regexp = new RegExp('\\b(?!\\' + g_options['bypass'] + ')(' + sub['search'] + ')(?!\\' + g_options['bypass'] + ')\\b', m_flags);
            } else {
                var regexp = new RegExp('(?!\\' + g_options['bypass'] + ')(' + sub['search'] + ')(?!\\' + g_options['bypass'] + ')', m_flags);
            }

            // check if replace doesn't contain backreferences, then match original case if possible
            if (/\$/.test(sub['replace']) || !m_options['matchCase']) {
                //text = text.replace(regexp, sub['replace']);
                text = text.replace(regexp, function (args) {
                    var args = Array.prototype.slice.call(arguments);

                    // if more than 4 args, then there are more than 1 backreferences
                    // search and replace for JS backreferences (i.e. $2, $3, etc.) and
                    // replace them with argument values for submatches
                    if (args.length > 4) {
                        var replacement_text = sub['replace'];
                        for (var i = 2; i < args.length - 1; i++) {
                            replacement_text = replacement_text.replace('$' + i, args[i]);
                        }
                        return replacement_text;
                    }
                    // a regular replacement
                    if (args[1]) {
                        return sub['replace'];
                    }
                    // bypassed
                    else {
                        return args[0];
                    }
                });
            } else {
                text = text.replace(regexp, function (match, p1) {
                    if (p1) {
                        // all caps if original was all caps
                        if (p1 === p1.toUpperCase()) {
                            return sub['replace'].toUpperCase();
                        }
                        // capitalize if original was capitalized
                        else if (p1[0] === p1[0].toUpperCase()) {
                            return sub['replace'].charAt(0).toUpperCase() + sub['replace'].slice(1);
                        }

                        return sub['replace'].toLowerCase();
                    } else {
                        return match;
                    }
                });
            }
        }
    });

    // remove bypass brackets
    var re_bypass = new RegExp('\\' + g_options['bypass'] + '(.+?)' + '\\' + g_options['bypass'], 'ig');
    text = text.replace(re_bypass, '$1');

    return text;
};


module.exports = grep;
