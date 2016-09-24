'use strict';

const { uniqueMatch } = require('../../utils/string');
const babel = require('babel-core');

const RE_HELPER = /babelHelpers\.([a-zA-Z]+)\(/gm;

/**
 * Transpile 'content' based on Babel 'options'
 * @param {JSFile} file
 * @param {Object} options
 */
module.exports = function transpile (file, options) {
  if (!options.plugins.length || options.presets && !options.presets.length) return;

  const transform = file.ast
    ? babel.transformFromAst(file.ast, file.content, options)
    : babel.transform(file.content, options);

  file.content = transform.code;
  file.ast = transform.ast;
  file.helpers = uniqueMatch(file.content, RE_HELPER).map((item) => item.match);
};