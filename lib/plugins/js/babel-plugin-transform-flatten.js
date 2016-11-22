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
      VariableDeclarator (path) {
        const name = path.node.id.name;
        const parent = path.parentPath;
        const rootScope = path.scope.getProgramParent();

        if (name in rootScope.uids) {
          path.getFunctionParent().scope.registerDeclaration(parent);
        }
      },

      Identifier: {
        enter (path, state) {
          const { opts } = state;
          const name = path.node.name;

          if (opts.replace && (name == 'module' || name == 'exports')) {
            replaceModuleExports(path, opts.source.moduleExports);
          } else if (!name.includes(opts.source.namespace) && !name.includes(opts.source.moduleExports)) {
            renameRootDeclarations(path, opts.source.namespace);
          }
        }
      }
    }
  };
};

/**
 * Replace module/exports with 'name'
 * @param {NodePath} path
 * @param {String} name
 */
function replaceModuleExports (path, name) {
  const { scope } = path;
  const oldName = path.node.name;

  // Skip if not global scope
  if (scope.hasBinding(oldName, true)) return;

  // TODO: correctly replace foo.exports with object.property?
  if (!isPropertyOrKey(path)) {
    path.node.name = (oldName == 'module') ? name : `${name}.exports`;
  }
}

/**
 * Rename declarations and references in global scope
 * @param {NodePath} path
 * @param {String} namespace
 */
function renameRootDeclarations (path, namespace) {
  const { scope } = path;
  const oldName = path.node.name;
  const rootScope = scope.getProgramParent();
  const binding = scope.getBinding(oldName);
  const newName = `${namespace}${oldName}`;

  if (binding) {
    if (!path.isReferenced() && shouldRenameDeclaration(oldName, path, binding, rootScope)) {
      path.node.name = newName;
      // Handle references
      if (binding.referenced) {
        binding.referencePaths.forEach((path) => {
          path.node.name = newName;
        });
      }
    }
  }
}

/**
 * Retrieve declaration parent for 'path'
 * @param {NodePath} path
 * @returns {NodePath}
 */
function getDeclarationParent (path) {
  do {
    if (path.isFunctionDeclaration()
      || path.isVariableDeclaration()
      || path.isClassDeclaration()
      || path.isAssignmentExpression()) {
        return path;
    }
  } while (path = path.parentPath);
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
 * Determine if declaration 'path' should be renamed
 * @param {String} name
 * @param {NodePath} path
 * @param {Binding} binding
 * @param {Scope} rootScope
 * @returns {Boolean}
 */
function shouldRenameDeclaration (name, path, binding, rootScope) {
  const isRootScope = path.scope === rootScope;
  const isGlobal = isRootScope && (name in rootScope.globals);
  const program = rootScope.path;

  if (isGlobal) return false;

  if (!isRootScope) {
    const functionParent = path.getFunctionParent();
    const declarationParent = getDeclarationParent(path);

    // Bail if not a declaration or is property/key of object
    if (!declarationParent || isPropertyOrKey(path)) return false;

    if (declarationParent.isBlockScoped()) {
      // Handle function declaration (which defines it's own scope)
      if (declarationParent.isFunctionDeclaration()) {
        return declarationParent.parentPath.scope === rootScope && declarationParent.node.id === path.node;
      }
      // Skip let/const in block scope
      return false;
    // Handle re-assignment of root bound declaration (ignore function expressions)
    } else if (declarationParent.isAssignmentExpression() && !path.parentPath.isFunctionExpression()) {
      const declarationBinding = declarationParent.scope.getBinding(name);

      return declarationBinding
        ? declarationBinding.scope === rootScope
        : false;
      // Skip if in function scope
    } else if (functionParent !== program) {
      return false;
    }
  }

  // Skip if property or key of object
  return !isPropertyOrKey(path);
}