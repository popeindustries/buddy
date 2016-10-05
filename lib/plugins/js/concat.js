'use strict';

const { buildExternalHelpers } = require('babel-core');
const replaceEnvironment = require('./replaceEnvironment');

const RE_LAST_MODULE_DECLARATION = /\$m\['([^']+)'\]\s=\s(?=[^$m\[]*$)/;
const RE_WRAP_CLOSE = /\s}\)\(\)\s?$/;
const RE_WRAP_OPEN = /([\s\S]+?)\/\*==/;
const REQUIRE_BOILERPLATE = `if ('undefined' === typeof self) var self = this;
if ('undefined' === typeof global) var global = self;
if ('undefined' === typeof process) var process = { env: {} };
var $m = self.$m = self.$m || {};
var require = self.require || function require (id) {
  if ($m[id]) {
    if ('function' == typeof $m[id]) $m[id]();
    return $m[id].exports;
  }

  if (process.env.NODE_ENV == 'development') {
    console.warn('module ' + id + ' not found');
  }
};`;
const REQUIRE_NODE_BOILERPLATE = `var $m = {};
var originalRequire = require;
require = function buddyRequire (id) {
  if (!$m[id]) return originalRequire(id);
  if ('function' == typeof $m[id]) $m[id]();
  return $m[id].exports;
};`;

/**
 * Concatenate dependency content for 'file'
 * @param {JSFile} file
 * @param {String} header
 * @param {Object} buildOptions
 *  - {Boolean} bootstrap
 *  - {Boolean} boilerplate
 *  - {Boolean} browser
 *  - {Boolean} bundle
 *  - {Boolean} compress
 *  - {Array} ignoredFiles
 *  - {Boolean} helpers
 *  - {Boolean} watchOnly
 * @returns {String}
 */
module.exports = function concat (file, header, buildOptions) {
  const { boilerplate, bootstrap, browser, helpers } = buildOptions;
  const contents = [];
  // Ignore inlined json
  const dependencies = file.getAllDependencies(true);

  // Add header
  contents.push(header);

  // Add require boilerplate
  if (boilerplate) {
    contents.push(browser
      // Replace process.env.NODE_ENV
      ? replaceEnvironment(REQUIRE_BOILERPLATE)
      : REQUIRE_NODE_BOILERPLATE
    );
  }

  // Add helpers
  if (helpers) {
    const allHelpers = file.getAllHelpers();

    if (allHelpers.length) contents.push(buildExternalHelpers(allHelpers));
  }

  // Add wrapper open
  if (browser) {
    contents.push(bootstrap
      ? '(function () {'
      : `$m['${file.id}'] = function () {`
    );
  }

  // Add dependencies
  contents.push(...dependencies.map((dependency) => {
    return dependency.isBuddyBuilt
      ? dependency.content
      : wrap(dependency, dependency.isCircularDependency) + '\n';
  }));

  // Add file contents
  contents.push(wrap(file, false));

  // Add wrapper close
  if (browser) {
    contents.push(`}${bootstrap ? ')()' : ''}`);
  }

  return contents.join('\n');
};

/**
 * Undo wrapping for 'file'
 * @param {JSFile} file
 * @returns {String}
 */
module.exports.unwrap = function unwrap (file) {
  let content = file.content.replace(RE_WRAP_OPEN, '/*==').replace(RE_WRAP_CLOSE, '');
  const lastModule = RE_LAST_MODULE_DECLARATION.exec(content);

  // Remap module declaration if file id doesn't match bundle entry id
  if (lastModule[1] != file.id) {
    content = content.replace(lastModule[0], `$m['${file.id}'] = ${lastModule[0]}`);
  }

  // We can't assume there will be no conflicts, so wrap in closure
  return `(function () {\n${content}\n})()\n`;
};

/**
 * Wrap 'file' contents
 * @param {File} file
 * @param {Boolean} isCircularDependency
 * @returns {String}
 */
function wrap (file, isCircularDependency) {
  return `/*== ${file.relpath} ==*/\n`
    + `$m['${file.id}'] = ${isCircularDependency ? 'function () {\n$m[\'' + file.id + '\'] = ' : ''}{ exports: {} };\n`
    + `${file.content}\n`
    + `${isCircularDependency ? '};\n' : ''}/*≠≠ ${file.relpath} ≠≠*/`;
}