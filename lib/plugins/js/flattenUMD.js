'use strict';

const RE_UMD_BOILERPLATE = /^[\s\S]{1,400}typeof define\s?===\s?["']function["']\s?&&\s?define\.amd/;
const RE_MODULE = /module/g;
const RE_EXPORTS = /[^.]exports/g;

/**
 * Flatten UMD 'content'
 * @param {String} content
 * @param {String} moduleString
 * @returns {String}
 */
module.exports = function flattenUMD (content, moduleString) {
  const match = RE_UMD_BOILERPLATE.exec(content);
  const boilerplate = match && match[0];

  if (boilerplate) {
    content = content.replace(boilerplate, boilerplate
      .replace(RE_MODULE, moduleString)
      .replace(RE_EXPORTS, ` ${moduleString}.exports`)
    );
  }

  return content;
};