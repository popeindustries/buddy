'use strict';

const babel = require('babel-core');

/**
 * Flatten 'content' scope
 * @param {JSFile} file
 * @param {Boolean} replace
 * @param {Object} options
 */
module.exports = function flatten (file, replace) {
  const options = {
    filename: file.filepath,
    plugins: [[flattenPlugin, {
      replace,
      source: {
        moduleExports: `$m['${file.id}']`,
        namespace: `_${file.idSafe}_`
      }
    }]]
  };
  const transform = file.ast
    ? babel.transformFromAst(file.ast, file.content, options)
    : babel.transform(file.content, options);

  file.content = transform.code;
  file.ast = transform.ast;
};

/**
 * Identifier visitor to namespace all declarations in root scope,
 * and replace 'module/exports' global references
 * @param {Babel} babel
 * @returns {Object}
 */
function flattenPlugin (babel) {
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
            // Don't replace 'bar' in 'foo.bar', only 'foo[bar]'
            if (path.parentPath.get('property') == path && !path.parentPath.node.computed) return;
            path.node.name = `${opts.source.namespace}${name}`;
          }
        }
      }
    }
  };
}

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