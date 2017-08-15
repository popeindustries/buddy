// @flow

'use strict';

/**
 * Identifier visitor to namespace all declarations in root scope,
 * and replace 'module/exports' global references
 */
module.exports = function flatten(babel: Object): Object {
  return {
    visitor: {
      VariableDeclarator(path: Object) {
        const name = path.node.id.name;
        const parent = path.parentPath;
        const rootScope = path.scope.getProgramParent();

        if (name in rootScope.uids) {
          path.getFunctionParent().scope.registerDeclaration(parent);
        }
      },

      Identifier: {
        enter(path: Object, state: Object) {
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
 */
function replaceModuleExports(path: Object, name: string) {
  const { scope } = path;
  const oldName = path.node.name;

  // Skip if not global scope
  if (scope.hasBinding(oldName, true)) {
    return;
  }

  // TODO: correctly replace foo.exports with object.property?
  if (!isPropertyOrKey(path)) {
    path.node.name = oldName == 'module' ? name : `${name}.exports`;
  }
}

/**
 * Rename declarations and references in global scope
 */
function renameRootDeclarations(path: Object, namespace: string) {
  const { scope } = path;
  const oldName = path.node.name;
  const rootScope = scope.getProgramParent();
  const isRootScope = scope === rootScope;
  const newName = `${namespace}${oldName}`;
  let binding = scope.getBinding(oldName);

  if (binding) {
    if (!path.isReferenced() && shouldRenameDeclaration(oldName, path, binding, rootScope)) {
      path.node.name = newName;
      if (!isRootScope) {
        const declarationParent = getDeclarationParent(path);

        // Function declaration defines own scope, so switch to parent
        if (declarationParent != null && declarationParent.isFunctionDeclaration()) {
          binding = declarationParent.scope.parent.getBinding(oldName);
        }
      }
      // Handle references
      if (binding.referenced) {
        binding.referencePaths.forEach(path => {
          path.node.name = newName;
        });
      }
    }
  }
}

/**
 * Retrieve declaration parent for 'path'
 */
function getDeclarationParent(path: Object): ?Object {
  do {
    if (
      path.isFunctionDeclaration() ||
      path.isVariableDeclaration() ||
      path.isClassDeclaration() ||
      path.isAssignmentExpression()
    ) {
      return path;
    }
  } while ((path = path.parentPath));
}

/**
 * Determine if 'path' is an key or property of another object
 */
function isPropertyOrKey(path: Object): boolean {
  return path.parentPath.get('key') === path || path.parentPath.get('property') === path;
}

/**
 * Determine if declaration 'path' should be renamed
 */
function shouldRenameDeclaration(name: string, path: Object, binding: Object, rootScope: Object): boolean {
  const isRootScope = path.scope === rootScope;
  const isGlobal = isRootScope && name in rootScope.globals;
  const program = rootScope.path;

  if (isGlobal) {
    return false;
  }

  if (!isRootScope) {
    const functionParent = path.getFunctionParent();
    const declarationParent = getDeclarationParent(path);

    // Bail if not a declaration or is property/key of object
    if (declarationParent == null || isPropertyOrKey(path)) {
      return false;
    }

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

      return declarationBinding ? declarationBinding.scope === rootScope : false;
      // Skip if in function scope
    } else if (functionParent !== program) {
      return false;
    }
  }

  // Skip if property or key of object
  return !isPropertyOrKey(path);
}
