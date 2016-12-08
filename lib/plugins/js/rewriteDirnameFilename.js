'use strict';

const path = require('path');

const RE_DIRNAME = /__dirname([\s+,)])/g;
const RE_FILENAME = /__filename([\s+,)])/g;

/**
 * Rewrite __dirname/__filename references with resolved
 * @param {String} content
 * @param {String} writedir
 * @param {String} filepath
 * @returns {String}
 */
module.exports = function rewriteDirnameFilename (content, writedir, filepath) {
  const hasDirname = RE_DIRNAME.test(content);
  const hasFilename = RE_FILENAME.test(content);

  if (!hasDirname && !hasFilename) return content;

  if (hasDirname) {
    const dirname = `require('path').resolve('${path.relative(writedir, path.dirname(filepath))}')$1`;

    content = content.replace(RE_DIRNAME, dirname);
  }

  if (hasFilename) {
    const filename = `require('path').resolve('${path.relative(writedir, filepath)}')$1`;

    content = content.replace(RE_FILENAME, filename);
  }

  return content;
};