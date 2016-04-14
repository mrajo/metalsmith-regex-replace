'use strict';

var assert = require('assert');
var dir_equal = require('assert-dir-equal');
var Metalsmith = require('metalsmith');
var replace = require('../');
var join = require('path').join;
var read = require('fs').readFileSync;
var buffer_equal = require('buffer-equal');
var utf8 = require('is-utf8');

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

describe('metalsmith-regex-replace', function () {
  it('should error if given no subs', function (done) {
    function runMetalsmith() {
      Metalsmith('test/fixtures/no-subs')
        .use(replace())
        .build();
    }

    assert.throws(runMetalsmith, /Invalid arguments/);
    done();
  });

  describe('should accept various argument types', function () {
    it('should accept an object of subs', function (done) {
      var src = 'test/fixtures/subs-object';

      Metalsmith(src)
        .use(replace({
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
        .use(replace(function () {
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
        .use(replace(src + '/subs.json'))
        .build(assertDirsEqual(src, done));
    });

    it('should accept a string containing the path to a YAML file of subs', function (done) {
      var src = 'test/fixtures/subs-file-yaml';

      Metalsmith(src)
        .use(replace(src + '/subs.yml'))
        .build(assertDirsEqual(src, done));
    });
  });

  describe('should accept various search and replace formats', function () {
    it('should accept search pattern as string', function (done) {
      var src = 'test/fixtures/search-string';

      Metalsmith(src)
        .use(replace({
          subs: [
            {
              search: 'teh',
              replace: 'the'
            }
          ]
        }))
        .build(assertDirsEqual(src, done));
    });

    it('should accept search pattern as RegExp literal', function (done) {
      var src = 'test/fixtures/search-regexp-literal';

      Metalsmith(src)
        .use(replace({
          subs: [
            {
              search: /\t/g,
              replace: '  '
            }
          ]
        }))
        .build(assertDirsEqual(src, done));
    });

    it('should accept search pattern as RegExp object instance', function (done) {
      var src = 'test/fixtures/search-regexp';

      Metalsmith(src)
        .use(replace({
          subs: [
            {
              search: new RegExp('\t', 'g'),
              replace: '  '
            }
          ]
        }))
        .build(assertDirsEqual(src, done));
    });

    it('should accept a function as a replacement', function (done) {
      var src = 'test/fixtures/replace-function';

      Metalsmith(src)
        .use(replace({
          subs: [
            {
              search: /([a-z])([A-Z])/g,
              replace: function (match, p1, p2) {
                return p1 + '_' + p2.toLowerCase();
              }
            }
          ]
        }))
        .build(assertDirsEqual(src, done));
    });

    it('should allow backreferences in sub["replace"]', function (done) {
      var src = 'test/fixtures/replace-backref';

      Metalsmith(src)
        .clean(false)
        .use(replace({
          subs: [
            {
              search: 'ghost',
              replace: 'owl'
            },
            {
              search: 'bo(o+)',
              replace: 'ho$2'
            },
            {
              search: '2Pac-(.+?)-([0-9]{4})',
              replace: '2Pac - $2 ($3)'
            }
          ]
        }))
        .build(assertFilesEqual(src, 'boo.txt', done));
    });
  });

  describe('should accept options', function () {
    it('should have default options', function (done) {
      var src = 'test/fixtures/options-default';

      Metalsmith(src)
        .use(replace({
          subs: [
            {
              search: 'Spot',
              replace: 'Rex'
            }
          ]
        }))
        .build(assertDirsEqual(src, done));
    });

    it('should accept an object of global options to override defaults', function (done) {
      var src = 'test/fixtures/options-global';

      Metalsmith(src)
        .use(replace({
          options: {
            caseSensitive: true,
            matchCase: false,
            isolatedWord: false,
            bypass: '`'
          },
          subs: [
            {
              search: 'Spot',
              replace: 'Rex'
            }
          ]
        }))
        .build(assertDirsEqual(src, done));
    });

    it('should accept an object of match options to override defaults and globals', function (done) {
      var src = 'test/fixtures/options-match';

      Metalsmith(src)
        .use(replace({
          options: {
            caseSensitive: true,
            matchCase: false,
            isolatedWord: false
          },
          subs: [
            {
              search: 'Spot',
              replace: 'Rex',
              options: {
                caseSensitive: false,
                matchCase: true,
                isolatedWord: true
              }
            }
          ]
        }))
        .build(assertDirsEqual(src, done));
    });
  });

  describe('should preserve case', function (done) {
    it('should replace all caps target with all caps substitute', function (done) {
      var src = 'test/fixtures/preserve-case';

      Metalsmith(src)
        .ignore('!allcaps.txt')
        .use(replace({
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
        .ignore('!capitalized.txt')
        .use(replace({
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
    var _replace = replace({
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
        .use(_replace)
        .build(assertFilesEqual(src, 'BOL.txt', done));
    });

    it('should work at the end of the file', function (done) {
      var src = 'test/fixtures/word-boundaries';

      Metalsmith(src)
        .use(_replace)
        .build(assertFilesEqual(src, 'EOL.txt', done));
    });

    it('should work with brackets', function (done) {
      var src = 'test/fixtures/word-boundaries';

      Metalsmith(src)
        .use(_replace)
        .build(assertFilesEqual(src, 'brackets.txt', done));
    });

    it('should work in possessive forms', function (done) {
      var src = 'test/fixtures/word-boundaries';

      Metalsmith(src)
        .use(_replace)
        .build(assertFilesEqual(src, 'possessive.txt', done));
    });

    it('should preserve the original word case', function (done) {
      var src = 'test/fixtures/word-boundaries';

      Metalsmith(src)
        .use(_replace)
        .build(assertFilesEqual(src, 'preserve_original_case.txt', done));
    });

    it('should work with punctuation', function (done) {
      var src = 'test/fixtures/word-boundaries';

      Metalsmith(src)
        .use(_replace)
        .build(assertFilesEqual(src, 'punctuation.txt', done));
    });

    it('should ignore target within other words', function (done) {
      var src = 'test/fixtures/word-boundaries';

      Metalsmith(src)
        .use(_replace)
        .build(assertFilesEqual(src, 'word_within_word.txt', done));
    });

    it('should not substitute if they are enclosed in vertical pipes', function (done) {
      var src = 'test/fixtures/bypass';

      Metalsmith(src)
        .use(replace({
          subs: [
            {
              search: 'shit',
              replace: 'poop'
            },
            {
              search: 'shitty',
              replace: 'gross'
            },
            {
              search: 'badger',
              replace: 'snake'
            },
            {
              search: 'marty',
              replace: 'moomoo'
            }
          ]
        }))
        .build(assertDirsEqual(src, done));
    });
  });
});
