'use strict';

/**
 Internal object for performing search and replace.
 This is not a port or implementation of grep.
**/

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
var grep = function (text, subs) {
    // regex for words enclosed in vertical pipes
    var re_piped = new RegExp('[|](.+?)[|]', 'ig');

    // preserve bracketed words
    text = text.replace(re_piped, function (match, p1) { return '|' + rot(p1) + '|'; });

    // substitute
    subs.forEach(function (sub, index) {
        var regexp = new RegExp('\\b(' + sub['search'] + ')\\b', 'ig');

        // check if replace contains backreferences
        if (/\$/.test(sub['replace'])) {
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
                } else {
                    return sub['replace'].toLowerCase();
                }
            });
        }
    });

    // restore preserved words
    text = text.replace(re_piped, function (match, p1) { return rot(p1); });

    return text;
};


module.exports = grep;