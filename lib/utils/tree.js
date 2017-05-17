'use strict';

const { isEmptyArray, isNullOrUndefined } = require('./is');

module.exports = {
  /**
   * Walk tree of 'nodes' and call 'visitor' on each
   * If 'visitor' returns more nodes, keep walking
   * 'revisitor' will be called after potential recursive walk
   * @param {Array} nodes
   * @param {Function} visitor
   * @param {Function} [revisitor]
   */
  walk(nodes, visitor, revisitor) {
    function _walk(nodes) {
      if (!isNullOrUndefined(nodes)) {
        for (let i = 0, n = nodes.length; i < n; i++) {
          const moreNodes = visitor(nodes[i]);

          if (!isEmptyArray(moreNodes)) {
            _walk(moreNodes);
          }
          if (!isNullOrUndefined(revisitor)) {
            revisitor(nodes[i]);
          }
        }
      }
    }

    _walk(nodes);
  }
};
