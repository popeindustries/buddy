'use strict';

module.exports = function (babel) {
  return {
    visitor: {
      Program (path, state) {
        const prefix = state.opts.id.replace(/[.-_\s]/g, '');

        for (const key in path.scope.bindings) {
          const binding = path.scope.bindings[key];

          binding.scope.rename(key, `_${prefix}_${key}`);
        }
      }
    }
  };
};