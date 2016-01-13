'use strict';

var fs = require('fs')
  , inlineContext = require('inline-source/lib/context')
  , inlineParse = require('inline-source/lib/parse')
  , path = require('path')
  , unique = require('lodash/uniq')

  , RE_REQUIRE = /require\(['|"](.*?)['|"]\)/g
  , RE_IMPORT = /@import\s['|"](.*?)['|"];?/g
  // HTML templates include/extend
  , RE_INCLUDE = /(?:{>\s?|include |{% extends |{% include )['|"]?(.*?)['|"]?[\s|}]/g
  // Line starting with '//'
  , RE_COMMENT_SINGLE_LINE = /^\s*(?:\/\/|#).+$/gm
  // Multi line block '/** ... */'
  , RE_COMMENT_MULTI_LINES = /((?:\/\*(?:[^*]|(?:\*+[^*\/]))*\*+\/))$/gm;

/**
 * Retrieve all dependency references in 'file' content
 * @param {String} filepath
 * @param {String} type
 * @param {String} content
 * @param {Function} fn(err, deps)
 */
module.exports = function (filepath, type, content, fn) {
  let results = [];

  if (type == 'html') {
    // Check for sidecar data files
    const extension = path.extname(filepath)
      , name = path.basename(filepath)
      , datapath = path.resolve(path.dirname(this.filepath), name.replace(extension, '.json'));

    if (fs.existsSync(datapath)) {
      results.push({
        filepath: datapath,
        match: ''
      });
    }

    // Parse inlineable HTML content
    let context = inlineContext.create({ compress: false });

    context.html = content;
    context.htmlpath = filepath;
    inlineParse(context, (err) => {
      if (err) return fn(err);
      fn(null, match(RE_INCLUDE, content, results.concat(context.sources.slice())));
    });
  } else {
    // Remove commented lines
    content = content.replace(RE_COMMENT_SINGLE_LINE, '');
    content = content.replace(RE_COMMENT_MULTI_LINES, '');
    fn(null, match((type == 'js') ? RE_REQUIRE : RE_IMPORT, content, results));
  }
};

/**
 * Match 're' in 'content' and store in 'results'
 * @param {RegExp} re
 * @param {String} content
 * @param {Array} results
 * @returns {Array}
 */
function match (re, content, results) {
  let m;

  while (m = re.exec(content)) {
    results.push({
      filepath: m[1],
      match: m[0]
    });
  }

  // Filter duplicates
  return unique(results, (result) => {
    return result.filepath;
  });
}