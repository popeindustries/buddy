'use strict';

/**
 * Identifier visitor to namespace all declarations in root scope,
 * and replace 'module/exports' global references
 * @param {Babel} babel
 * @returns {Object}
 */
module.exports = function flatten (babel) {
  return {
    visitor: {
      Identifier (path, state) {
        const { opts } = state;
        const { scope } = path;
        const name = path.node.name;
        const rootScope = scope.getProgramParent();

        // Replace global 'module' and 'exports' references
        if (name in rootScope.globals) {
          if (opts.replace && !scope.hasBinding(name, true)) {
            // Replace 'module' with '$m[*]'
            if (isValidIdentifier('module', path)) {
              path.replaceWithSourceString(opts.source.moduleExports);
            // Replace 'exports' with '$m[*]' if not a property of another object
            } else if (isValidIdentifier('exports', path)) {
              path.replaceWithSourceString(`${opts.source.moduleExports}.exports`);
            }
          }

        // Namespace all root declarations
        } else {
          const binding = scope.getBinding(name);

          // Target root declarations only
          if (binding && binding.scope === rootScope) {
            // Don't replace if object key ...
            if (path.parentPath.get('key') == path
              // ... or not computed property (replace 'bar' in 'foo[bar]', not 'foo.bar')
              || path.parentPath.get('property') == path && !path.parentPath.node.computed) {
                return;
            }
            path.node.name = `${opts.source.namespace}${name}`;
          }
        }
      }
    }
  };
};

/**
 * Determine if 'name' is valid identifier
 * @param {String} name
 * @param {Path} path
 * @returns {Boolean}
 */
function isValidIdentifier (name, path) {
  return path.node.name == name
    && path.parentPath.get('property') != path
    && path.parentPath.get('key') != path;
}