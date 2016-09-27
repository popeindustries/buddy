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
        // Rename all declarations in root scope
        for (const key in path.scope.bindings) {
          path.scope.bindings[key].scope.rename(key, `${state.opts.source}${key}`);
        }
      }
    }
  };
};