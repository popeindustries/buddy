'use strict';

/**
 * Identifier visitor to namespace all declarations in root scope,
 * and replace 'module/exports' global references
 * @param {Babel} babel
 * @returns {Object}
 */
module.exports = function flatten (babel) {
  const { types: t } = babel;

  return {
    visitor: {
      'AssignmentExpression|VariableDeclarator|FunctionDeclaration|ClassDeclaration': {
        exit (path, state) {
          const { opts } = state;
          const { scope } = path;
          const key = path.isAssignmentExpression() ? 'left' : 'id';
          const identifier = path.node[key];
          const rootScope = scope.getProgramParent();

          if (identifier && identifier.name) {
            const oldName = identifier.name;
            const binding = scope.getBinding(oldName);
            const newName = `${opts.source.namespace}${oldName}`;
            const newNode = t.identifier(newName);

            if (isRootScope(binding, rootScope)) {
              path.get(key).replaceWith(newNode);
              if (binding.referenced) {
                binding.referencePaths.forEach((path) => {
                  path.replaceWith(newNode);
                });
              }
            }
          }
        }
      },
      Identifier: {
        exit (path, state) {
          const { opts } = state;
          const { scope } = path;
          const oldName = path.node.name;

          if (!opts.replace || scope.hasBinding(oldName, true) || (oldName != 'module' && oldName != 'exports')) return;

          const newName = (oldName == 'module') ? opts.source.moduleExports : `${opts.source.moduleExports}.exports`;
          const newNode = t.identifier(newName);

          if (isReplaceableIdentifier(path)) path.replaceWith(newNode);
        }
      }
    }
  };
};

/**
 * Determine if 'path' is replaceable
 * @param {Path} path
 * @returns {Boolean}
 */
function isReplaceableIdentifier (path) {
  return path.parentPath.get('key') != path
    && path.parentPath.get('property') != path;
}

/**
 * Determine if 'binding' is defined in 'rootScope'
 * @param {Binding} binding
 * @param {Scope} rootScope
 * @returns {Boolean}
 */
function isRootScope (binding, rootScope) {
  if (binding && binding.scope == rootScope) {
    // Some plugins will insert nodes with incorrect binding/scope
    // (babel-plugin-transform-es2015-parameters rest handling, for example).
    // If the declaration is in Function scope, it should not be replaced
    if (!binding.path.node.loc) {
      let parent = binding.path;

      while (parent) {
        if (parent.isFunction()) return false;
        parent = parent.parentPath;
      }
    }

    return true;
  }

  return false;
}