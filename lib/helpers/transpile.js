'use strict';

const babel = require('babel-core');

/**
 * Transpile 'content'
 * @param {String} id
 * @param {String} content
 * @param {Object} options
 * @param {Function} fn(err, content)
 */
module.exports = function transpile (id, content, options, fn) {
  try {
    const transform = babel.transform(content, {
      plugins: [
        [namespaceRootDeclarations, { id }],
        replaceEnvironmentVariables
      ]
    });

    fn(null, transform.code);
  } catch (err) {
    err.filepath = options.filepath;
    fn(err);
  }
};

/**
 * Plugin to namespace all declarations in root scope
 * @param {Babel} babel
 * @returns {Object}
 */
function namespaceRootDeclarations (babel) {
  return {
    visitor: {
      Program (path, state) {
        const prefix = state.opts.id.replace(/[.-_\s]/g, '');

        for (const key in path.scope.bindings) {
          const binding = path.scope.bindings[key];

          binding.scope.rename(key, `_${prefix}_${key}`);
        }
      }
    }
  };
}

/**
 * Plugin to replace environment variables
 * Based on: https://www.npmjs.com/package/babel-plugin-transform-inline-environment-variables
 * @param {Babel} babel
 * @returns {Object}
 */
function replaceEnvironmentVariables (babel) {
  const t = babel.types;

  return {
    visitor: {
      MemberExpression (path, state) {
        if (path.get('object').matchesPattern('process.env')) {
          const key = path.toComputedKey();

          if (t.isStringLiteral(key)) {
            const prop = key.value;
            // Force RUNTIME to "browser"
            const value = (prop == 'RUNTIME')
              ? 'browser'
              : process.env[prop];

            // Don't replace if undefined
            if (value) path.replaceWith(t.valueToNode(value));
          }
        }
      }
    }
  };
}