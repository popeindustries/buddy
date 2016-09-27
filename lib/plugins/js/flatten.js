'use strict';

const babel = require('babel-core');
const namespaceRootDeclarations = require('./babel-plugin-transform-namespace-root-declarations');
const replaceModuleExports = require('./babel-plugin-transform-replace-module-exports');

/**
 * Flatten 'content' scope
 * @param {JSFile} file
 * @param {Boolean} replace
 * @param {Object} options
 */
module.exports = function flatten (file, replace) {
  let plugins = [
    [namespaceRootDeclarations, { source: `_${file.idSafe}_` }],
    [replaceModuleExports, { source: `$m['${file.id}']` }]
  ];

  if (!replace) plugins.pop();

  const options = {
    filename: file.filename,
    plugins
  };
  const transform = file.ast
    ? babel.transformFromAst(file.ast, file.content, options)
    : babel.transform(file.content, options);

  file.content = transform.code;
  file.ast = transform.ast;
};