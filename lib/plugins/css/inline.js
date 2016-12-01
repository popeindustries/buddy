'use strict';

const { regexpEscape } = require('../../utils/string');

/**
 * Inline dependencyReferences for 'file'
 * @param {CSSFile} file
 */
module.exports = function inline (file) {
  function inline (file) {
    const matches = [];

    file.dependencyReferences.forEach((reference) => {
      // Inline nested dependencies
      // Duplicates are allowed (not @import_once)
      if (reference.file.dependencyReferences.length) inline(reference.file);
      // Replace @import * with inlined content
      if (reference.context) {
        const re = new RegExp(regexpEscape(reference.context), 'g');
        let match;

        while (match = re.exec(file.content)) {
          matches.push([reference.context, match.index, reference.file]);
        }
      }
    });

    if (matches.length) file.replaceContent(matches);
  }

  inline(file);
};