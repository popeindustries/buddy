// @flow

'use strict';

export type TreeUtils = {
  walk: (Array<any>, (any) => ?Array<any>, ?(any) => void) => void
};

const { isEmptyArray } = require('./is');

module.exports = {
  /**
   * Walk tree of 'nodes' and call 'visitor' on each
   * If 'visitor' returns more nodes, keep walking
   * 'revisitor' will be called after potential recursive walk
   */
  walk(nodes: Array<any>, visitor: (node: any) => ?Array<any>, revisitor?: (node: any) => void) {
    function _walk(nodes: Array<any>) {
      if (nodes != null) {
        for (let i = 0, n = nodes.length; i < n; i++) {
          const moreNodes = visitor(nodes[i]);

          if (moreNodes != null && !isEmptyArray(moreNodes)) {
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
