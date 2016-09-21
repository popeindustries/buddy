'use strict';

const babel = require('babel-core');
const clone = require('lodash/cloneDeep');
const namespaceRootDeclarations = require('./babel-plugin-transform-namespace-root-declarations');
const replaceModuleExports = require('./babel-plugin-transform-replace-module-exports');

/**
 * Transpile 'content' based on 'workflow' and Babel 'options'
 * @param {JSFile} file
 * @param {Array} workflow
 * @param {Object} options
 */
module.exports = function transpile (file, workflow, options) {
  // TODO: filter plugins based on file origin
  if (!workflow.length) return;

  options = clone(options);
  options.plugins.push(...workflow.map((item) => {
    switch (item) {
      case 'namespaceRootDeclarations':
        return [namespaceRootDeclarations, { source: `_${file.idSafe}_` }];
      case 'replaceModuleExports':
        return [replaceModuleExports, { source: `$m['${file.id}']` }];
    }
  }));

  const transform = babel.transform(file.content, options);

  file.content = transform.code;
  // file.ast = transform.ast;
  // file.map = transform.map;
};