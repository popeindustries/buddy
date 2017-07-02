// @flow

'use strict';

const { isEmptyArray } = require('../../utils/is');
const babel = require('babel-core');

/**
 * Transpile 'content' based on Babel 'options'
 */
module.exports = function transpile(content: string, options: BuildOptions): { code: string, map: Object } {
  if (isEmptyArray(options.plugins) || (options.presets != null && isEmptyArray(options.presets))) {
    return { code: content, map: null };
  }

  return babel.transform(content, options);
};
