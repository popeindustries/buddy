// @flow

'use strict';

const { regexpEscape } = require('../../utils/string');

/**
 * Replace 'dependencyReferences' in 'content'
 */
module.exports = function replaceReferences(content: string, dependencyReferences: Array<Object>): string {
  for (const reference of dependencyReferences) {
    // Ignore inlineable references
    if (
      !reference.isDisabled &&
      reference.file != null &&
      reference.file.type !== 'json' &&
      reference.context != null
    ) {
      // Don't inline 'require' call if ignored, locked, or circular
      const context =
        !reference.isIgnored && !reference.file.isLocked && !reference.file.isCircularDependency
          ? `$m['${reference.file.id}'].exports`
          : reference.context.replace(reference.id, reference.file.id);
      // Create new RegExp so that flags work properly
      content = content.replace(new RegExp(regexpEscape(reference.context), 'g'), context);
    }
  }

  return content;
};
