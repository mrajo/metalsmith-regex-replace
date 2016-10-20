'use strict'

const assert = require('assert')
const dir_equal = require('assert-dir-equal')
const Metalsmith = require('metalsmith')
const replace = require('../')
const join = require('path').join
const read = require('fs').readFileSync
const buffer_equal = require('buffer-equal')
const utf8 = require('is-utf8')

const assertDirsEqual = (src, done) => {
  return (err) => {
    if (err) return done(err)
    dir_equal(join(src, 'expected'), join(src, 'build'))
    done()
  }
}

const assertFilesEqual = (src, file, done) => {
  return (err) => {
    const file_a = read(join(src, 'expected', file))
    const file_b = read(join(src, 'build', file))

    if (utf8(file_a) && utf8(file_b)) {
      assert.equal(file_a.toString(), file_b.toString())
    } else {
      assert(buffer_equal(file_a, file_b))
    }

    done()
  }
}

describe('metalsmith-regex-replace', () => {
  it('should error if given no subs', (done) => {
    const runMetalsmith = () => {
      Metalsmith('test/fixtures/no-subs')
        .use(replace())
        .build()
    }

    assert.throws(runMetalsmith, /Invalid arguments/)
    done()
  })

  describe('should accept various argument types', () => {
    it('should accept an object of subs', (done) => {
      const src = 'test/fixtures/subs-object'

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
        .build(assertDirsEqual(src, done))
    })

    it('should accept a function that returns an object of subs', (done) => {
      const src = 'test/fixtures/subs-function'

      Metalsmith(src)
        .use(replace(() => {
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
          }
        }))
        .build(assertDirsEqual(src, done))
    })

    it('should accept a string containing the path to a JSON file of subs', (done) => {
      const src = 'test/fixtures/subs-file-json'

      Metalsmith(src)
        .use(replace(src + '/subs.json'))
        .build(assertDirsEqual(src, done))
    })

    it('should accept a string containing the path to a YAML file of subs', (done) => {
      const src = 'test/fixtures/subs-file-yaml'

      Metalsmith(src)
        .use(replace(src + '/subs.yml'))
        .build(assertDirsEqual(src, done))
    })
  })

  describe('should accept various search and replace formats', () => {
    it('should accept search pattern as string', (done) => {
      const src = 'test/fixtures/search-string'

      Metalsmith(src)
        .use(replace({
          subs: [
            {
              search: 'teh',
              replace: 'the'
            }
          ]
        }))
        .build(assertDirsEqual(src, done))
    })

    it('should accept search pattern as RegExp literal', (done) => {
      const src = 'test/fixtures/search-regexp-literal'

      Metalsmith(src)
        .use(replace({
          subs: [
            {
              search: /\t/g,
              replace: '  '
            }
          ]
        }))
        .build(assertDirsEqual(src, done))
    })

    it('should accept search pattern as RegExp object instance', (done) => {
      const src = 'test/fixtures/search-regexp'

      Metalsmith(src)
        .use(replace({
          subs: [
            {
              search: new RegExp('\t', 'g'),
              replace: '  '
            }
          ]
        }))
        .build(assertDirsEqual(src, done))
    })

    it('should accept a function as a replacement', (done) => {
      const src = 'test/fixtures/replace-function'

      Metalsmith(src)
        .use(replace({
          subs: [
            {
              search: /([a-z])([A-Z])/g,
              replace: (match, p1, p2) => {
                return p1 + '_' + p2.toLowerCase()
              }
            }
          ]
        }))
        .build(assertDirsEqual(src, done))
    })

    it('should allow backreferences in sub["replace"]', (done) => {
      const src = 'test/fixtures/replace-backref'

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
        .build(assertFilesEqual(src, 'boo.txt', done))
    })
  })

  describe('should accept options', () => {
    it('should have default options', (done) => {
      const src = 'test/fixtures/options-default'

      Metalsmith(src)
        .use(replace({
          subs: [
            {
              search: 'Spot',
              replace: 'Rex'
            }
          ]
        }))
        .build(assertDirsEqual(src, done))
    })

    it('should accept an object of global options to override defaults', (done) => {
      const src = 'test/fixtures/options-global'

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
        .build(assertDirsEqual(src, done))
    })

    it('should accept an object of match options to override defaults and globals', (done) => {
      const src = 'test/fixtures/options-match'

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
        .build(assertDirsEqual(src, done))
    })
  })

  describe('should preserve case', (done) => {
    it('should replace all caps target with all caps substitute', (done) => {
      const src = 'test/fixtures/preserve-case'

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
        .build(assertFilesEqual(src, 'allcaps.txt', done))
    })

    it('should replace capitalized target with capitalized substitute', (done) => {
      const src = 'test/fixtures/preserve-case'

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
        .build(assertFilesEqual(src, 'capitalized.txt', done))
    })
  })

  describe('should work with various word boundaries', () => {
    const _replace = replace({
      subs: [
        {
          search: 'ninja',
          replace: 'blarg'
        }
      ]
    })

    it('should work at the beginning of the file', (done) => {
      const src = 'test/fixtures/word-boundaries'

      Metalsmith(src)
        .use(_replace)
        .build(assertFilesEqual(src, 'BOL.txt', done))
    })

    it('should work at the end of the file', (done) => {
      const src = 'test/fixtures/word-boundaries'

      Metalsmith(src)
        .use(_replace)
        .build(assertFilesEqual(src, 'EOL.txt', done))
    })

    it('should work with brackets', (done) => {
      const src = 'test/fixtures/word-boundaries'

      Metalsmith(src)
        .use(_replace)
        .build(assertFilesEqual(src, 'brackets.txt', done))
    })

    it('should work in possessive forms', (done) => {
      const src = 'test/fixtures/word-boundaries'

      Metalsmith(src)
        .use(_replace)
        .build(assertFilesEqual(src, 'possessive.txt', done))
    })

    it('should preserve the original word case', (done) => {
      const src = 'test/fixtures/word-boundaries'

      Metalsmith(src)
        .use(_replace)
        .build(assertFilesEqual(src, 'preserve_original_case.txt', done))
    })

    it('should work with punctuation', (done) => {
      const src = 'test/fixtures/word-boundaries'

      Metalsmith(src)
        .use(_replace)
        .build(assertFilesEqual(src, 'punctuation.txt', done))
    })

    it('should ignore target within other words', (done) => {
      const src = 'test/fixtures/word-boundaries'

      Metalsmith(src)
        .use(_replace)
        .build(assertFilesEqual(src, 'word_within_word.txt', done))
    })

    it('should not substitute if they are enclosed in vertical pipes', (done) => {
      const src = 'test/fixtures/bypass'

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
        .build(assertDirsEqual(src, done))
    })
  })
})
