'use strict';

const RE_UMD_BOILERPLATE = /\(function[^\(]*?\([^\)]+\)\s?{[\s\S]+?function\s?\(\)\s?{/;
const RE_MODULE = /module/g;
const RE_EXPORTS = /[^.]exports/g;

/**
 * Flatten UMD 'content'
 * @param {String} content
 * @param {String} moduleString
 * @returns {String}
 */
module.exports = function flattenUMD (content, moduleString) {
  const boilerplate = RE_UMD_BOILERPLATE.exec(content)[0];

  if (boilerplate) {
    content = content.replace(boilerplate, boilerplate
      .replace(RE_MODULE, moduleString)
      .replace(RE_EXPORTS, ` ${moduleString}.exports`)
    );
  }

  return content;
};