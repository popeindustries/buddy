'use strict';

const { regexpEscape } = require('../../utils/string');

/**
 * Inline json/disabled dependency content
 * @param {String} content
 * @param {Array} dependencyReferences
 * @returns {String}
 */
module.exports = function inline (content, dependencyReferences) {
  for (const reference of dependencyReferences) {
    let context = '';

    // Handle disabled
    if (reference.isDisabled) {
      context = '{}';
    // Inline json
    } else if (reference.file && reference.file.type == 'json') {
      // Remove line breaks to preserve source map line positions
      context = (reference.file.content || '{}').replace(/\n/g, '');
    }
    // Replace require(*) with inlined content
    if (context) content = content.replace(new RegExp(regexpEscape(reference.context), 'g'), context);
  }

  return content;
};