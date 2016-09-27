'use strict';

/**
 * Plugin to namespace all declarations in root scope
 * @param {Babel} babel
 * @returns {Object}
 */
module.exports = function replaceModuleExports (babel) {
  return {
    visitor: {
      Identifier (path, state) {
        const { opts } = state;
        const { scope } = path;
        const name = path.node.name;

        // Target globals only
        if (!scope.hasBinding(name, true)) {
          // Replace 'module' with '$m[*]'
          if (name == 'module') {
            path.replaceWithSourceString(opts.source);
          // Replace 'exports' with '$m[*]' if not a property of another object
          } else if (name == 'exports' && path.parentPath.get('property') != path) {
            path.replaceWithSourceString(`${opts.source}.exports`);
          }
        }
      }
    }
  };
};