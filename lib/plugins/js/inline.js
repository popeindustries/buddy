'use strict';

const { regexpEscape } = require('../../utils/string');

/**
 * Inline json/disabled dependency content
 * @param {String} content
 * @param {Set} dependencyReferences
 * @param {Boolean} browser
 * @returns {String}
 */
module.exports = function inline (content, dependencyReferences, browser) {
  for (const reference of dependencyReferences) {
    let inlineContent = '';

    // Handle disabled
    if (reference.isDisabled) {
      inlineContent = '{}';
    // Inline json
    } else if (reference.file && reference.file.type == 'json') {
      inlineContent = reference.file.content || '{}';
    }
    // Replace require(*) with inlined content
    if (inlineContent) content = content.replace(new RegExp(regexpEscape(reference.context), 'mg'), inlineContent);
  }

  return content;
};