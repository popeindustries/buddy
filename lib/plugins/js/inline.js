'use strict';

const { regexpEscape } = require('../../utils/string');

/**
 * Inline json/disabled dependency content
 * @param {String} content
 * @param {SourceNode} map
 * @param {Array} dependencyReferences
 * @returns {String}
 */
module.exports = function inline (content, map, dependencyReferences) {
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
    if (inlineContent) {
      // Create new RegExp so that flags work properly
      const re = new RegExp(regexpEscape(reference.context), 'gm');

      content = content.replace(re, inlineContent);
      map.replaceRight(re, inlineContent);
    }
  }

  return { content, map };
};