'use strict';

const MagicString = require('magic-string');

const RE_UMD_BOILERPLATE = /\(function[^\(]*?\([^\)]+\)\s?{[\s\S]+?function\s?\(\)\s?{/;
const RE_MODULE = /module/g;
const RE_EXPORTS = /[^.]exports/g;

/**
 * Flatten UMD 'content'
 * @param {MagicString} content
 * @param {String} moduleString
 * @returns {MagicString}
 */
module.exports = function flattenUMD (content, moduleString) {
  content = content.toString();

  const boilerplate = RE_UMD_BOILERPLATE.exec(content)[0];

  if (boilerplate) {
    content = content.replace(boilerplate, boilerplate
      .replace(RE_MODULE, moduleString)
      .replace(RE_EXPORTS, ` ${moduleString}.exports`)
    );
  }

  // Don't need to preserve history, so return new
  return new MagicString(content);
};