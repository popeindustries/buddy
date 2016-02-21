'use strict';

const indent = require('../utils/cnsl').indent

  , RE_WRAPPED = /require\.register\(/;

/**
 * Wrap 'content' in module definition
 * @param {String} id
 * @param {String} content
 * @returns {String}
 */
module.exports = function (id, content) {
  // Reset regex
  RE_WRAPPED.lastIndex = 0;

  // Don't wrap if already wrapped
  if (!RE_WRAPPED.test(content)) {
    content = `require.register('${id}', function(require, module, exports) {\n${indent(content, 2)}\n});`;
  }

  return content;
};