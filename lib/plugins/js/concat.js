'use strict';

const { buildExternalHelpers } = require('babel-core');
const replaceEnvironment = require('./replaceEnvironment');

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
  const dependencies = file.getAllDependencies()
    .filter((dependency) => dependency.type != 'json');

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
      ? '!(function () {'
      : `$m['${file.id}'] = function () {`
    );
  }

  // Add dependencies
  dependencies.forEach((dependency) => {
    contents.push(
      `/*== ${dependency.relpath} ==*/`,
      `$m['${dependency.id}'] = ${dependency.isCircularDependency ? 'function () {\n$m[\'' + dependency.id + '\'] = ' : ''}{ exports: {} };`,
      dependency.content,
      `${dependency.isCircularDependency ? '};\n' : ''}/*≠≠ ${dependency.relpath} ≠≠*/\n`
    );
  });

  // Add file contents
  contents.push(
    `/*== ${file.relpath} ==*/`,
    `$m['${file.id}'] = { exports: {} };`,
    file.content,
    `/*≠≠ ${file.relpath} ≠≠*/`
  );

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
  // TODO: fix this
  const content = file.content
    .replace(`$m['${file.id}'] = { exports: {} };\n`, '')
    .replace(`/*== ${file.relpath} ==*/\n`, '')
    .replace(`/*≠≠ ${file.relpath} ≠≠*/\n`, '');
  const start = content.indexOf('!(function () {');
  const end = content.lastIndexOf('})()');

  return content.slice(start + 16, end - 1);
};