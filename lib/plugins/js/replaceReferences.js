'use strict';

const { regexpEscape } = require('../../utils/string');

/**
 * Replace 'references' in 'content'
 * @param {String} content
 * @param {Array} references
 * @param {Boolean} browser
 * @returns {String}
 */
module.exports = function replaceReferences (content, references, browser) {
  references.forEach((reference) => {
    // Ignore inlineable references
    if (!reference.isDisabled && reference.file.type != 'json') {
      // Strip version number for non-browser builds
      const id = browser
        ? reference.file.id
        : reference.file.id.split('#')[0];
      // Don't inline 'require' call if circular, ignored, or locked
      const context = !reference.isIgnored
        ? `$m['${reference.file.id}']`
        : reference.context.replace(reference.id, id);

      // Create new RegExp so that flags work properly
      content = content.replace(new RegExp(regexpEscape(reference.context), 'gm'), context);
    }
  });

  return content;
};