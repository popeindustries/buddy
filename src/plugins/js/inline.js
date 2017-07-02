// @flow

'use strict';

const { isNullOrUndefined } = require('../../utils/is');
const { regexpEscape } = require('../../utils/string');

/**
 * Inline json/disabled dependency content
 */
module.exports = function inline(content: string, dependencyReferences: Array<Object>): string {
  for (const reference of dependencyReferences) {
    let context = '';

    // Handle disabled
    if (reference.isDisabled) {
      context = '{}';
      // Inline json
    } else if (!isNullOrUndefined(reference.file) && reference.file.type === 'json') {
      // Remove line breaks to preserve source map line positions
      context = (reference.file.content || '{}').replace(/\n/g, '');
    }
    // Replace require(*) with inlined content
    if (context !== '') {
      content = content.replace(new RegExp(regexpEscape(reference.context), 'g'), context);
    }
  }

  return content;
};
