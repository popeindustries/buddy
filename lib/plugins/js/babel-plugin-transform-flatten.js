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
            if (isReplaceableIdentifier('module', path)) {
              path.replaceWithSourceString(opts.source.moduleExports);
            // Replace 'exports' with '$m[*]' if not a property of another object
            } else if (isReplaceableIdentifier('exports', path)) {
              path.replaceWithSourceString(`${opts.source.moduleExports}.exports`);
            }
          }

        // Namespace all root declarations
        } else {
          const binding = scope.getBinding(name);

          // Target root declarations only
          if (binding && binding.scope === rootScope) {
            if (!isReplaceableReference(path)) return;
            path.replaceWithSourceString(`${opts.source.namespace}${name}`);
          }
        }
      }
    }
  };
};

/**
 * Determine if 'name' is replaceable
 * @param {String} name
 * @param {Path} path
 * @returns {Boolean}
 */
function isReplaceableIdentifier (name, path) {
  return path.node.name == name
    && path.parentPath.get('key') != path
    && path.parentPath.get('property') != path;
}

/**
 * Determine if 'path' is valid identifier
 * @param {Path} path
 * @returns {Boolean}
 */
function isReplaceableReference (path) {
  // Not object keys
  return !(path.parentPath.get('key') == path
    // Not computed properties
    || (path.parentPath.get('property') == path && !path.parentPath.node.computed));
}