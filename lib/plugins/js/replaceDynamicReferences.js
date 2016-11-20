'use strict';

const { regexpEscape } = require('../../utils/string');
const path = require('path');

/**
 * Replace 'dependencyReferences' in 'content'
 * @param {String} content
 * @param {String} baseurl
 * @param {Array} dependencyReferences
 * @returns {String}
 */
module.exports = function replaceDynamicReferences (content, baseurl, dependencyReferences) {
  for (const reference of dependencyReferences) {
    const url = path.join(baseurl, path.basename(reference.file.filepath));
    const quoteStyle = reference.context.charAt(reference.context.indexOf(reference.id) - 1);
    const context = reference.context.replace(reference.id, `${url}${quoteStyle}, ${quoteStyle}${reference.file.id}`);

    // Create new RegExp so that flags work properly
    content = content.replace(new RegExp(regexpEscape(reference.context), 'gm'), context);
  }

  return content;
};