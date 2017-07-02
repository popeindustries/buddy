// @flow

'use strict';

const { regexpEscape } = require('../../utils/string');

const BUDDY_IMPORT = 'buddyImport';
const IMPORT = 'import';

/**
 * Replace 'dependencyReferences' in 'content'
 */
module.exports = function replaceDynamicReferences(
  content: string,
  browser: boolean,
  dependencyReferences: Array<Object>
): string {
  for (const reference of dependencyReferences) {
    const url = browser ? reference.file.writeUrl : reference.file.filepath;
    const quoteStyle = reference.context.charAt(reference.context.indexOf(reference.id) - 1);
    const context = reference.context
      .replace(reference.id, `${url}${quoteStyle}, ${quoteStyle}${reference.file.id}`)
      .replace(IMPORT, BUDDY_IMPORT);

    // Create new RegExp so that flags work properly
    content = content.replace(new RegExp(regexpEscape(reference.context), 'g'), context);
  }

  return content;
};
