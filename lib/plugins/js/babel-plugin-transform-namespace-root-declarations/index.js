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
          const binding = path.scope.bindings[key];

          binding.scope.rename(key, `_${state.opts.id}_${key}`);
        }
      }
    }
  };
};