'use strict';

const { regexpEscape } = require('../../utils/string');

/**
 * Inline CSS @import statements
 * @param {String} content
 * @param {Array} references
 * @returns {String}
 */
module.exports = function inline (content, references) {
  function inline (inlineContent, inlineReferences) {
    let inlined;

    inlineReferences.forEach((reference) => {
      // Inline nested dependencies
      // Duplicates are allowed (not @import_once)
      inlined = reference.file.dependencyReferences.length
        ? inline(reference.file.content, reference.file.dependencyReferences)
        : reference.file.content;
      // Replace @import * with inlined content
      inlineContent = inlineContent.replace(new RegExp(regexpEscape(reference.context), 'mg'), inlined);
    });

    return inlineContent;
  }

  // TODO: remove comments?
  return inline(content, references);
};
