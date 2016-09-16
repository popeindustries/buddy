'use strict';

const indent = require('../utils/cnsl').indent;

const RE_WRAPPED = /\_m_\['[^']+'\]=\(function\(module,exports\){/;

/**
 * Wrap 'file' content in module definition
 * @param {File} file
 * @returns {String}
 */
module.exports = function (file) {
  let content = file.content;

  // Reset regex
  RE_WRAPPED.lastIndex = 0;

  // Don't wrap if already wrapped
  if (!RE_WRAPPED.test(content)) {
    content = `_m_['${file.id}']=(function(module,exports){\n  module=this;exports=module.exports;\n\n${indent(content, 1)}\n\n  return module.exports;\n}).call({exports:{}});`;
  }

  return content;
};