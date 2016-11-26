'use strict';

const { regexpEscape, replace } = require('../../utils/string');

/**
 * Inline json/disabled dependency content
 * @param {MagicString} string
 * @param {Array} dependencyReferences
 */
module.exports = function inline (string, dependencyReferences) {
  for (const reference of dependencyReferences) {
    let context = '';

    // Handle disabled
    if (reference.isDisabled) {
      context = '{}';
    // Inline json
    } else if (reference.file && reference.file.type == 'json') {
      context = (reference.file.content.toString() || '{}').replace(/\n/g, '');
    }
    // Replace require(*) with inlined content
    if (context) {
      replace(string, new RegExp(regexpEscape(reference.context), 'g'), context);
    }
  }
};