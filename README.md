# metalsmith-regex-replace [![Build Status](https://travis-ci.org/mrajo/metalsmith-regex-replace.svg)](https://travis-ci.org/mrajo/metalsmith-regex-replace)

> A Metalsmith plugin for performing text search and replace in source files

This plugin allows for specifying a list of pairs of search/replace operations
to perform during a Metalsmith build. This can be used to fix common typos,
censor NSFW text, hide sensitive information, etc.

## Install

```
npm install metalsmith-regex-replace
```

## Usage

The plugin requires an object with a key called `subs`, containing an array of
substition objects with keys for `search` and `replace`.

### search
Type: `string` or `RegExp`

### replace
Type: `string` or `function`

If using a function for `replace` argument, it should have a signature as
described in `String.prototype.replace` ([MDN reference](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replace#Specifying_a_function_as_a_parameter)).

### Example
```javascript
{
  subs: [
    {
      search: "some text or simple pattern",
      replace: "the replacement text"
    },
    {
      search: /more text/,
      replace: "another replacement"
    },
    {
      search: new RegExp("another search"),
      replace: "yet another replacement"
    }
    ...
  ]
}
```

You can pass either an object directly, a path to a JSON or YAML file, or a
function that returns an object.

### Passing an object

```javascript
var Metalsmith = require('metalsmith');
var replace = require('metalsmith-regex-replace');

Metalsmith(__dirname)
    .use(replace({
        subs: [
            {
                search: 'teh',
                replace: 'the'
            }
        ]
    }))
    .build();
```

### Passing a file

YAML file must end with extension `.yaml` or `.yml`.
```yaml
subs:
  - search: teh
    replace: the
```

JSON file must end with extension `.json`.
```json
{
    "subs": [
        {
            "search": "teh",
            "replace": "the"
        }
    ]
}
```

Javascript
```javascript
var Metalsmith = require('metalsmith');
var replace = require('metalsmith-regex-replace');

// YAML
Metalsmith(__dirname)
    .use(replace('path/to/subs.yaml'))
    .build();

// JSON
Metalsmith(__dirname)
    .use(replace('path/to/subs.json'))
    .build();
```

### Passing a function

```javascript
var Metalsmith = require('metalsmith');
var replace = require('metalsmith-regex-replace');

function makeSubs() {
  // do stuff
  return {
      subs: [
          {
              search: 'teh',
              replace: 'the'
          }
      ]
  };
}

Metalsmith(__dirname)
    .use(replace(makeSubs))
    .build();
```

## Substitution options

Options can be supplied in an object at the root of the plugin argument object,
alongside the `subs` key. These will be global options applied to each search
and replace pair. Additionally, each match in the `subs` object can be supplied
an `options` object to override the global options and allow for options on a
per-match basis.

These options are used when `search` is a string or when `replace`
is a function. In those situations, the plugin gives you full control over the
`RegExp` patterns and replacements.

### Example
```javascript
{
  options: {
    // global options here
  },
  subs: [
    {
      search: "some text or simple pattern",
      replace: "the replacement text",
      options: {
        // options for just this match here, overriding global options
      }
    },
    ...
  ]
}
```

#### caseSensitive
Type: `Boolean`
Default: `false`

Sets the `i` flag for the `RegExp` expression. You can set the `i` flag explicitly
for each match as usual, this just allows for setting it globally and making
the subs list look nicer.

#### matchCase
Type: `Boolean`
Default: `false`

Changes replacement text to the case of the original match. If original match is
all caps, the replacement will be all caps. If the original match was capitalized,
the replacement will be capitalized. If the original match was all lowercase,
the replacement will be all lowercase. This option is ignored if `caseSensitive`
is `true`.

#### isolatedWord
Type: `Boolean`
Default: `true`

Wraps the search text in RegExp word boundaries (`\b`) automatically. This is just
a helper to make the replacement strings look cleaner.

#### bypass
Type: `String` (one character) or `null` or `false`
Default: `"|"`

When text in source is enclosed between the `bypass` string, it will be ignored
by the substitution filter. This can be changed if necessary, or set to `null`
or `false` to disable this behavior. This must be a one-character string. This
option is always global and can't be overridden per-match, since it wouldn't
make sense. For more information on bypassing, read on to "Bypassing regex-replace".

## Bypassing regex-replace
To allow a word to bypass replacement (such as homonyms or other instances of
words changing meaning with context), surround it with vertical pipes in your
source, like `|word|`. This wrapper character can be overridden using the
`bypass` option. For example:

#### Original source
```
There once was a man named Bob who liked to bob for apples.
```

#### Javascript
```
Metalsmith(__dirname)
    .use(replace({
        subs: [
            {
                search: 'bob',
                replace: 'Paul'
            }
        ]
    }))
    .build();
```

#### Bad output; we don't want to replace the second instance of "bob"
```
There once was a man named Paul who liked to Paul for apples.
```

#### Modified source
```
There once was a man named Bob who liked to |bob| for apples.
```

#### New output
```
There once was a man named Paul who liked to bob for apples.
```

## License

MIT © [Anthony Castle](http://github.com/mrajo)
