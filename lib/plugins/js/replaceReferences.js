'use strict';

const { regexpEscape } = require('../../utils/string');

/**
 * Replace 'references' in 'content'
 * @param {String} content
 * @param {Array} references
 * @returns {String}
 */
module.exports = function replaceReferences (content, references) {
  references.forEach((reference) => {
    // Ignore inlineable references
    if (!reference.isDisabled && reference.file.type != 'json') {
      // Don't inline 'require' call if circular, ignored, or locked
      const context = !reference.isIgnored
        ? `$m['${reference.file.id}']`
        : reference.context.replace(reference.id, reference.file.id);

      // Create new RegExp so that flags work properly
      content = content.replace(new RegExp(regexpEscape(reference.context), 'gm'), context);
    }
  });

  return content;
};