'use strict';

const fs = require('fs');
const inlineContext = require('inline-source/lib/context');
const inlineParse = require('inline-source/lib/parse');
const path = require('path');
const unique = require('lodash/uniq');

const RE_REQUIRE = /require\(['"]([^'"]+)[^)]+\)/g;
const RE_IMPORT = /@import\s['"]([^'"]+)['"];?/g;
// HTML templates include/extend
const RE_INCLUDE = /(?:{>\s?|include |{% extends |{% include )['"]?([^'"\s]+)['"\s]/g;
// Line starting with '//'
const RE_COMMENT_SINGLE_LINE = /^\s*(?:\/\/|#).+$/gm;
// Multi line block '/** ... */'
const RE_COMMENT_MULTI_LINES = /((?:\/\*(?:[^*]|(?:\*+[^*\/]))*\*+\/))$/gm;

/**
 * Retrieve all dependency references for 'file'
 * @param {File} file
 * @param {Function} fn(err, deps)
 */
module.exports = function parse (file, fn) {
  let content = file.content;
  let results = [];

  if (file.type == 'html') {
    // Check for sidecar data files
    const datapath = path.resolve(path.dirname(file.filepath), file.name.replace(`.${file.extension}`, '.json'));

    if (fs.existsSync(datapath)) {
      results.push({
        filepath: datapath,
        match: ''
      });
    }
    fn(null, match(RE_INCLUDE, file.content, results));
  } else {
    // Remove commented lines
    content = content.replace(RE_COMMENT_SINGLE_LINE, '');
    content = content.replace(RE_COMMENT_MULTI_LINES, '');
    fn(null, match((file.type == 'js') ? RE_REQUIRE : RE_IMPORT, content, results));
  }
};

/**
 * Retrieve all inlineable dependency references for 'file'
 * @param {File} file
 * @param {Function} fn(err, deps)
 */
module.exports.inline = function parseInline (file, fn) {
  let context = inlineContext.create({ compress: false });

  context.html = file.content;
  context.htmlpath = file.filepath;
  inlineParse(context, (err) => {
    if (err) return fn(err);
    fn(null, context.sources.slice());
  });
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