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

  // Skip if not global scope
  if (scope.hasBinding(oldName, true)) return;

  // TODO: correctly replace foo.exports with object.property
  if (!isPropertyOrKey(path)) {
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
  const binding = scope.getBinding(oldName);
  const newName = `${namespace}${oldName}`;
  const rootScope = scope.getProgramParent();

  if (binding) {
    if (!path.isReferenced() && shouldRenameBound(oldName, path, rootScope)) {
      const newNode = types.identifier(newName);

      path.replaceWith(newNode);
      // Handle references
      if (binding.referenced) {
        binding.referencePaths.forEach((path) => {
          path.replaceWith(newNode);
        });
      }
    }
  } else if (shouldRenameUnbound(oldName, path, rootScope)) {
    path.replaceWith(types.identifier(newName));
  }
}

/**
 * Determine if 'path' is an key or property of another object
 * @param {NodePath} path
 * @returns {Boolean}
 */
function isPropertyOrKey (path) {
  return path.parentPath.get('key') === path || path.parentPath.get('property') === path;
}

/**
 * Determine if bound 'path' should be renamed
 * @param {String} name
 * @param {NodePath} path
 * @param {Scope} rootScope
 * @returns {Boolean}
 */
function shouldRenameBound (name, path, rootScope) {
  const isRootScope = path.scope === rootScope;
  const isGlobalReference = isRootScope && (name in rootScope.globals);
  const parent = path.parentPath;

  if (isGlobalReference) return false;

  if (!isRootScope) {
    // Handle function declaration (ignore FunctionExpressions)
    if (parent.isFunction()) {
      return parent.isFunctionDeclaration() && parent.parentPath.scope === rootScope && parent.node.id === path.node;
    // Confirm really not root scope
    } else if (!isReallyRootScope(path.scope.getBinding(name).path, rootScope)) {
      return false;
    }
  }

  // Skip binding that is property or key
  return !isPropertyOrKey(path);
}

/**
 * Determine if unbound 'path' should be renamed
 * @param {String} name
 * @param {NodePath} path
 * @param {Scope} rootScope
 * @returns {Boolean}
 */
function shouldRenameUnbound (name, path, rootScope) {
  const isRootScope = path.scope === rootScope;
  const isGlobalReference = isRootScope && (name in rootScope.globals);

  if (isGlobalReference) return false;
  return isRootScope && name in rootScope.uids && !isPropertyOrKey(path) && isReallyRootScope(path, rootScope);
}

/**
 * Determine if 'path' is really defined in 'rootScope'
 * @param {NodePath} path
 * @param {Scope} rootScope
 * @returns {Boolean}
 */
function isReallyRootScope (path, rootScope) {
  if (path && path.scope === rootScope) {
    // Some plugins will insert nodes with incorrect binding/scope
    // (babel-plugin-transform-es2015-parameters rest handling, for example).
    // If the declaration is in Function scope, it should not be replaced
    if (!path.node.loc) {
      let parent = path;

      while (parent) {
        if (parent.isFunction()) return false;
        parent = parent.parentPath;
      }
    }

    return true;
  }

  return false;
}