'use strict';

var assert = require('assert');
var dir_equal = require('assert-dir-equal');
var Metalsmith = require('metalsmith');
var grep = require('../src');
var join = require('path').join;
var read = require('fs').readFileSync;
var buffer_equal = require('buffer-equal');
var utf8 = require('is-utf8');
var filter = require('../../metalsmith-filter');

function assertDirsEqual(src, done) {
    return function (err) {
        if (err) return done(err);
        dir_equal(join(src, 'expected'), join(src, 'build'));
        done();
    };
}

function assertFilesEqual(src, file, done) {
    return function (err) {
        var file_a = read(join(src, 'expected', file));
        var file_b = read(join(src, 'build', file));

        if (utf8(file_a) && utf8(file_b)) {
            assert.equal(file_a.toString(), file_b.toString());
        } else {
            assert(buffer_equal(file_a, file_b));
        }

        done();
    };
}

describe('metalsmith-grep', function () {
    it('should error if given no subs', function (done) {
        function runMetalsmith() {
            Metalsmith('test/fixtures/no-subs')
                .use(grep())
                .build();
        }

        assert.throws(runMetalsmith, /Invalid arguments/);
        done();
    });

    it('should accept an object of subs', function (done) {
        var src = 'test/fixtures/subs-object';

        Metalsmith(src)
            .use(grep({
                subs: [
                    {
                        search: 'bitch',
                        replace: 'girl'
                    },
                    {
                        search: 'fuck',
                        replace: 'mess'
                    }
                ]
            }))
            .build(assertDirsEqual(src, done));
    });

    it('should accept a function that returns an object of subs', function (done) {
        var src = 'test/fixtures/subs-function';

        Metalsmith(src)
            .use(grep(function () {
                return {
                    subs: [
                        {
                            search: 'pussy',
                            replace: 'women'
                        },
                        {
                            search: 'niggas',
                            replace: 'brethren'
                        }
                    ]
                };
            }))
            .build(assertDirsEqual(src, done));
    });

    it('should accept a string containing the path to a JSON file of subs', function (done) {
        var src = 'test/fixtures/subs-file-json';

        Metalsmith(src)
            .use(grep(src + '/subs.json'))
            .build(assertDirsEqual(src, done));
    });

    it('should accept a string containing the path to a YAML file of subs', function (done) {
        var src = 'test/fixtures/subs-file-yaml';

        Metalsmith(src)
            .use(grep(src + '/subs.yml'))
            .build(assertDirsEqual(src, done));
    });

    it('should not substitute if they are enclosed in vertical pipes', function (done) {
        var src = 'test/fixtures/bypass';

        Metalsmith(src)
            .use(grep({
                subs: [
                    {
                        search: 'shit',
                        replace: 'poop'
                    },
                    {
                        search: 'shitty',
                        replace: 'gross'
                    }
                ]
            }))
            .build(assertDirsEqual(src, done));
    });

    describe('should preserve case', function (done) {
        it('should replace all caps target with all caps substitute', function (done) {
            var src = 'test/fixtures/preserve-case';

            Metalsmith(src)
                .use(filter('allcaps.txt'))
                .use(grep({
                    subs: [
                        {
                            search: 'lion',
                            replace: 'tiger'
                        }
                    ]
                }))
                .build(assertFilesEqual(src, 'allcaps.txt', done));
        });

        it('should replace capitalized target with capitalized substitute', function (done) {
            var src = 'test/fixtures/preserve-case';

            Metalsmith(src)
                .clean(false)
                .use(filter('capitalized.txt'))
                .use(grep({
                    subs: [
                        {
                            search: 'clean',
                            replace: 'peanut'
                        }
                    ]
                }))
                .build(assertFilesEqual(src, 'capitalized.txt', done));
        });
    });

    describe('should work with various word boundaries', function () {
        var _grep = grep({
            subs: [
                {
                    search: 'ninja',
                    replace: 'blarg'
                }
            ]
        });

        it('should work at the beginning of the file', function (done) {
            var src = 'test/fixtures/word-boundaries';

            Metalsmith(src)
                .use(_grep)
                .build(assertFilesEqual(src, 'BOL.txt', done));
        });

        it('should work at the end of the file', function (done) {
            var src = 'test/fixtures/word-boundaries';

            Metalsmith(src)
                .use(_grep)
                .build(assertFilesEqual(src, 'EOL.txt', done));
        });

        it('should work with brackets', function (done) {
            var src = 'test/fixtures/word-boundaries';

            Metalsmith(src)
                .use(_grep)
                .build(assertFilesEqual(src, 'brackets.txt', done));
        });

        it('should work in possessive forms', function (done) {
            var src = 'test/fixtures/word-boundaries';

            Metalsmith(src)
                .use(_grep)
                .build(assertFilesEqual(src, 'possessive.txt', done));
        });

        it('should preserve the original word case', function (done) {
            var src = 'test/fixtures/word-boundaries';

            Metalsmith(src)
                .use(_grep)
                .build(assertFilesEqual(src, 'preserve_original_case.txt', done));
        });

        it('should work with punctuation', function (done) {
            var src = 'test/fixtures/word-boundaries';

            Metalsmith(src)
                .use(_grep)
                .build(assertFilesEqual(src, 'punctuation.txt', done));
        });

        it('should ignore target within other words', function (done) {
            var src = 'test/fixtures/word-boundaries';

            Metalsmith(src)
                .use(_grep)
                .build(assertFilesEqual(src, 'word_within_word.txt', done));
        });
    });

    describe('should allow regexp', function () {
        it('should allow regexp targets', function (done) {
            var src = 'test/fixtures/regexp-patterns';

            Metalsmith(src)
                .use(filter('moo.txt'))
                .use(grep({
                    subs: [
                        {
                            search: 'cow',
                            replace: 'cat'
                        },
                        {
                            search: 'moo+',
                            replace: 'meow'
                        }
                    ]
                }))
                .build(assertFilesEqual(src, 'moo.txt', done));
        });

        it('should allow backreferences in sub["replace"]', function (done) {
            var src = 'test/fixtures/regexp-patterns';

            Metalsmith(src)
                .clean(false)
                .use(filter('boo.txt'))
                .use(grep({
                    subs: [
                        {
                            search: 'ghost',
                            replace: 'owl'
                        },
                        {
                            search: 'bo(o+)',
                            replace: 'ho$2'
                        }
                    ]
                }))
                .build(assertFilesEqual(src, 'boo.txt', done));
        });
    });
});