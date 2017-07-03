// @flow

'use strict';

import type { RuntimeOptions } from './index';

const DEFAULT_OPTIONS: RuntimeOptions = {
  compress: false,
  debug: false,
  deploy: false,
  grep: false,
  invert: false,
  maps: false,
  reload: false,
  script: false,
  serve: false,
  watch: false
};

/**
 * Convert 'options' to valid RuntimeOptions object
 */
module.exports = function runtimeOptions(options: Object = {}): RuntimeOptions {
  return Object.assign({}, DEFAULT_OPTIONS, options);
};