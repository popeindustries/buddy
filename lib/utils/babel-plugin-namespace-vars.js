'use strict';

module.exports = function (babel) {
  return {
    visitor: {
      Program (path) {
        console.log(path)
        for (const key in path.scope.bindings) {
          const binding = path.scope.bindings[key];

          binding.scope.rename(key, `_1_${key}`);
        }
      }
    }
  };
};