'use strict';

const { regexpEscape } = require('../../utils/string');

/**
 * Replace 'dependencyReferences' in 'content'
 * @param {String} content
 * @param {SourceNode} map
 * @param {Boolean} browser
 * @param {Array} dependencyReferences
 * @returns {String}
 */
module.exports = function replaceDynamicReferences (content, map, browser, dependencyReferences) {
  for (const reference of dependencyReferences) {
    const url = browser
      ? reference.file.writeUrl
      : reference.file.filepath;
    const quoteStyle = reference.context.charAt(reference.context.indexOf(reference.id) - 1);
    const context = reference.context.replace(reference.id, `${url}${quoteStyle}, ${quoteStyle}${reference.file.id}`);
    // Create new RegExp so that flags work properly
    const re = new RegExp(regexpEscape(reference.context), 'gm');

    content = content.replace(re, context);
    map.replaceRight(re, context);
  }

  return { content, map };
};