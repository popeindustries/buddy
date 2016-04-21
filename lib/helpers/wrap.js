'use strict';

const indent = require('../utils/cnsl').indent

  , RE_WRAPPED = /\_m_\['[^']+'\]=\(function\(module,exports\){/;

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
    content = `_m_['${id}']=(function(module,exports){\n  module=this;exports=module.exports;\n\n${indent(content, 1)}\n\n  return module.exports;\n}).call({exports:{}});`;
  }

  return content;
};