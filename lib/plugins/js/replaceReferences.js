'use strict';

const { regexpEscape } = require('../../utils/string');

/**
 * Replace 'dependencyReferences' in 'content'
 * @param {MagicString} content
 * @param {Array} dependencyReferences
 * @returns {MagicString}
 */
module.exports = function replaceReferences (content, dependencyReferences) {
  const contentString = content.toString();

  for (const reference of dependencyReferences) {
    // Ignore inlineable references
    if (!reference.isDisabled && reference.file && reference.file.type != 'json') {
      // Don't inline 'require' call if ignored, circular, or locked
      const context = !reference.isIgnored && !reference.file.isCircularDependency
        ? `$m['${reference.file.id}'].exports`
        : reference.context.replace(reference.id, reference.file.id);
      const re = new RegExp(regexpEscape(reference.context), 'g');
      let match;

      while (match = re.exec(contentString)) {
        content.overwrite(match.index, match.index + match[0].length, context);
      }
    }
  }

  return content;
};