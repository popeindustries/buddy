'use strict';

module.exports = {
  /**
   * Retrieve shared decendants of 'ancestor' down to 'decendant'
   * Returns empty if 'decendant' isn't related to 'ancestor'
   * @param {Object} decendant
   * @param {Object} ancestor
   * @returns {Array}
   */
  getSharedDecendants (decendant, ancestor) {
    let decendants = [];
    let parent = decendant.parent;

    while (parent) {
      decendants.push(parent);
      // Stop when we hit ancestor or tree root
      parent = (parent === ancestor)
        ? null
        : parent.parent;
    }

    // Not related
    if (!decendants.includes(ancestor)) return [];
    return decendants.reverse();
  },

  /**
   * Walk tree of 'nodes' and call 'visitor' on each
   * If 'visitor' returns more nodes, keep walking
   * 'revisitor' will be called after potential recursive walk
   * @param {Array} nodes
   * @param {Function} visitor
   * @param {Function} [revisitor]
   */
  walk (nodes, visitor, revisitor) {
    function _walk (nodes) {
      if (nodes) {
        for (let i = 0, n = nodes.length; i < n; i++) {
          const moreNodes = visitor(nodes[i]);

          if (moreNodes && moreNodes.length) _walk(moreNodes);
          if (revisitor) revisitor(nodes[i]);
        }
      }
    }

    _walk(nodes);
  }
};