'use strict';

/**
 * Plugin to namespace all declarations in root scope
 * @param {Babel} babel
 * @returns {Object}
 */
module.exports = function namespaceRootDeclarations (babel) {
  return {
    visitor: {
      Program (path, state) {
        for (const key in path.scope.bindings) {
          path.scope.bindings[key].scope.rename(key, `_${state.opts.id}_${key}`);
        }
      }
    }
  };
};