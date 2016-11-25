'use strict';

const { regexpEscape, replace } = require('../../utils/string');

/**
 * Replace 'dependencyReferences' in 'string'
 * @param {MagicString} string
 * @param {Array} dependencyReferences
 */
module.exports = function replaceReferences (string, dependencyReferences) {
  for (const reference of dependencyReferences) {
    // Ignore inlineable references
    if (!reference.isDisabled && reference.file && reference.file.type != 'json') {
      // Don't inline 'require' call if ignored, circular, or locked
      const context = !reference.isIgnored && !reference.file.isCircularDependency
        ? `$m['${reference.file.id}'].exports`
        : reference.context.replace(reference.id, reference.file.id);

      replace(string, new RegExp(regexpEscape(reference.context), 'g'), context);
    }
  }
};