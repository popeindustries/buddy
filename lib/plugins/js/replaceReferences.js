'use strict';

const { regexpEscape } = require('../../utils/string');

/**
 * Replace 'dependencyReferences' in 'content'
 * @param {String} content
 * @param {SourceNode} map
 * @param {Array} dependencyReferences
 * @returns {String}
 */
module.exports = function replaceReferences (content, map, dependencyReferences) {
  for (const reference of dependencyReferences) {
    // Ignore inlineable references
    if (!reference.isDisabled && reference.file && reference.file.type != 'json') {
      // Don't inline 'require' call if ignored, circular, or locked
      const context = !reference.isIgnored && !reference.file.isCircularDependency
        ? `$m['${reference.file.id}'].exports`
        : reference.context.replace(reference.id, reference.file.id);
      // Create new RegExp so that flags work properly
      const re = new RegExp(regexpEscape(reference.context), 'gm');

      // content = content.replace(re, context);
      // map.replaceRight(re, context);
    }
  }

  return { content, map };
};