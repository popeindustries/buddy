'use strict';

var csslint = require('csslint').CSSLint
  , eslint = require('eslint')
  , eslintConf = require('eslint/lib/config')

  , ESLINT_CONFIG = {
      global: [
        'require:false',
        'module:true',
        'exports:true'
      ],
      env: [
        'browser'
      ]
    }
  , RE_TRIM = /^\s+|\s+$/

  , jsConfig = new eslintConf(ESLINT_CONFIG).getConfig();

/**
 * Lint 'content'
 * @param {String} type
 * @param {String} content
 * @returns {Array}
 */
module.exports = function (type, content) {
  return (type == 'js')
    ? lintJS(content)
    : lintCSS(content);
};

/**
 * Lint js 'content'
 * @param {String} content
 * @param {Object} options
 * @returns {Array}
 */
function lintJS (content, options) {
  const result = eslint.linter.verify(content, jsConfig);

  if (result.length) {
    return result.map((error) => {
      return {
        line: error.line,
        col: error.column,
        reason: error.message,
        evidence: (error.source != null)
          ? error.source.replace(RE_TRIM, '')
          : null
      };
    });
  }

  return null;
}

/**
 * Lint css 'content'
 * @param {String} content
 * @returns {Object}
 */
function lintCSS (content) {
  const result = csslint.verify(content);

  if (result.messages.length) {
    return result.messages.map((error) => {
      return {
        line: error.line,
        col: error.col,
        reason: error.message,
        evidence: (error.evidence != null)
          ? error.evidence.replace(RE_TRIM, '')
          : null
      };
    });
  }

  return null;
}