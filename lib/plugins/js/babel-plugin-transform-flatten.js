'use strict';

/**
 * Identifier visitor to namespace all declarations in root scope,
 * and replace 'module/exports' global references
 * @param {Babel} babel
 * @returns {Object}
 */
module.exports = function flatten (babel) {
  const { types } = babel;

  return {
    visitor: {
      Identifier: {
        exit (path, state) {
          const { opts } = state;
          const name = path.node.name;

          if (opts.replace && (name == 'module' || name == 'exports')) {
            replaceModuleExports(types, path, opts.source.moduleExports);
          } else if (!~name.indexOf(opts.source.namespace) && !~name.indexOf(opts.source.moduleExports)) {
            renameRootDeclarations(types, path, opts.source.namespace);
          }
        }
      }
    }
  };
};

/**
 * Replace module/exports with 'name'
 * @param {Types} types
 * @param {NodePath} path
 * @param {String} name
 */
function replaceModuleExports (types, path, name) {
  const { scope } = path;
  const oldName = path.node.name;
  const rootScope = scope.getProgramParent();

  // Skip if not global scope
  if (scope.hasBinding(oldName, true)) return;

  // TODO: correctly replace foo.exports with object.property
  if (isReplaceableIdentifier(oldName, path, rootScope, true)) {
    path.replaceWith(types.identifier((oldName == 'module') ? name : `${name}.exports`));
  }
}

/**
 * Rename declarations and references in global scope
 * @param {Types} types
 * @param {NodePath} path
 * @param {String} namespace
 */
function renameRootDeclarations (types, path, namespace) {
  const { scope } = path;
  const oldName = path.node.name;
  const newName = `${namespace}${oldName}`;
  const rootScope = scope.getProgramParent();

  // Handle declarations
  if (!path.isReferenced()) {
    if (!(oldName in rootScope.globals) && isReplaceableIdentifier(oldName, path, rootScope, false)) {
      const binding = scope.getBinding(oldName);
      const newNode = types.identifier(newName);

      path.replaceWith(newNode);
      // Handle references
      if (binding && binding.referenced) {
        binding.referencePaths.forEach((path) => {
          path.replaceWith(newNode);
        });
      }
    }
  // Catch references without binding due to rename
  } else if (oldName in scope.uids && !scope.getBinding(oldName)) {
    path.replaceWith(types.identifier(newName));
  }
}

/**
 * Determine if 'path' is replaceable identifier
 * @param {String} name
 * @param {Path} path
 * @param {Scope} rootScope
 * @param {Boolean} includeGlobal
 * @returns {Boolean}
 */
function isReplaceableIdentifier (name, path, rootScope, includeGlobal) {
  const parent = path.parentPath;
  const isRootScope = includeGlobal || (path.scope === rootScope);

  if (!isRootScope) {
    // Handle function declaration
    // Ignore FunctionExpressions
    if (parent.isFunction()) return parent.isFunctionDeclaration() && parent.parentPath.scope === rootScope && parent.node.id === path.node;
    // Handle incorrectly bound nodes
    if (!isReallyRootScope(path.scope.getBinding(name), rootScope)) return false;
  }

  // Beware computed key/property
  return parent.get('key') !== path && parent.get('property') !== path;
}

/**
 * Determine if 'binding' is defined in 'rootScope'
 * @param {Binding} binding
 * @param {Scope} rootScope
 * @returns {Boolean}
 */
function isReallyRootScope (binding, rootScope) {
  if (binding && binding.scope === rootScope) {
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