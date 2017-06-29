// @flow

'use strict';

const { isEmptyArray } = require('./is');

module.exports = {
  /**
   * Walk tree of 'nodes' and call 'visitor' on each
   * If 'visitor' returns more nodes, keep walking
   * 'revisitor' will be called after potential recursive walk
   */
  walk(nodes /*: Array<{}>*/, visitor/*: function */, revisitor/*: function */) {
    function _walk(nodes) {
      if (nodes != null) {
        for (let i = 0, n = nodes.length; i < n; i++) {
          const moreNodes = visitor(nodes[i]);

          if (!isEmptyArray(moreNodes)) {
            _walk(moreNodes);
          }
          if (revisitor != null) {
            revisitor(nodes[i]);
          }
        }
      }
    }

    _walk(nodes);
  }
};
