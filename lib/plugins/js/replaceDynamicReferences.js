'use strict';

const { regexpEscape } = require('../../utils/string');
const { strong, warn } = require('../../utils/cnsl');

const BUDDY_IMPORT = 'buddyImport';
const IMPORT = 'import';

/**
 * Replace 'dependencyReferences' in 'content'
 * @param {String} content
 * @param {Boolean} browser
 * @param {Array} dependencyReferences
 * @returns {String}
 */
module.exports = function replaceDynamicReferences (content, browser, dependencyReferences) {
  for (const reference of dependencyReferences) {
    if (reference.context.includes(BUDDY_IMPORT)) {
      warn(`${strong('buddyImport()')} syntax will soon be deprecated. Use ${strong('import()')} instead`, 3);
    }

    const url = browser
      ? reference.file.writeUrl
      : reference.file.filepath;
    const quoteStyle = reference.context.charAt(reference.context.indexOf(reference.id) - 1);
    const context = reference.context.replace(reference.id, `${url}${quoteStyle}, ${quoteStyle}${reference.file.id}`)
      .replace(IMPORT, BUDDY_IMPORT);

    // Create new RegExp so that flags work properly
    content = content.replace(new RegExp(regexpEscape(reference.context), 'g'), context);
  }

  return content;
};