'use strict';

const { regexpEscape } = require('../../utils/string');

/**
 * Replace 'references' in 'content'
 * @param {String} content
 * @param {Set} dependencyReferences
 * @param {Boolean} browser
 * @returns {String}
 */
module.exports = function replaceReferences (content, dependencyReferences) {
  for (const reference of dependencyReferences) {
    // Ignore inlineable references
    if (!reference.isDisabled && reference.file && reference.file.type != 'json') {
      // Don't inline 'require' call if ignored, circular, or locked
      const context = !reference.isIgnored && !reference.isCircular
        ? `$m['${reference.file.id}'].exports`
        : reference.context.replace(reference.id, reference.file.id);

      // Create new RegExp so that flags work properly
      content = content.replace(new RegExp(regexpEscape(reference.context), 'gm'), context);
    }
  }

  return content;
};