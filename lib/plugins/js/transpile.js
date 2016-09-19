'use strict';

const babel = require('babel-core');
const clone = require('lodash/cloneDeep');

const RE_ESCAPE_ID = /[._-\s/\\]/g;

/**
 * Transpile 'content' based on 'workflow' and Babel 'options'
 * @param {File} file
 * @param {Array} workflow
 * @param {Object} options
 */
module.exports = function transpile (file, workflow, options) {
  if (!workflow.length) return;

  options = clone(options);
  options.plugins.push(...workflow.map((item) => {
    if (item == 'namespaceRootDeclarations') {
      return [namespaceRootDeclarations, { id: file.id }];
    }
  }));

  const transform = babel.transform(file.content, options);

  file.content = transform.code;
  file.ast = transform.ast;
  file.map = transform.map;
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
        const prefix = state.opts.id.replace(RE_ESCAPE_ID, '');

        for (const key in path.scope.bindings) {
          const binding = path.scope.bindings[key];

          binding.scope.rename(key, `_${prefix}_${key}`);
        }
      }
    }
  };
}