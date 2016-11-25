'use strict';

const { regexpEscape } = require('../../utils/string');

/**
 * Inline json/disabled dependency content
 * @param {MagicString} content
 * @param {Array} dependencyReferences
 * @returns {MagicString}
 */
module.exports = function inline (content, dependencyReferences) {
  const contentString = content.toString();

  for (const reference of dependencyReferences) {
    let inlineContent = '';

    // Handle disabled
    if (reference.isDisabled) {
      inlineContent = '{}';
    // Inline json
    } else if (reference.file && reference.file.type == 'json') {
      inlineContent = (reference.file.content.toString() || '{}').replace(/\n/g, '');
    }
    // Replace require(*) with inlined content
    if (inlineContent) {
      const re = new RegExp(regexpEscape(reference.context), 'g');
      let match;

      while (match = re.exec(contentString)) {
        content.overwrite(match.index, match.index + match[0].length, inlineContent);
      }
    }
  }

  return content;
};