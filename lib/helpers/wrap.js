'use strict';

const indent = require('../utils/cnsl').indent

  , RE_WRAPPED = /\$m\['[^']+'\] = \(function \(module, exports\) {/;

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
    content = `$m['${id}']=(function(module,exports){\n  module=this;exports=module.exports;\n${indent(content, 2)}\n  return module.exports;\n}).call({filename:'${id}',exports:{}});`;
  }

  return content;
};