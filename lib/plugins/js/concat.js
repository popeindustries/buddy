'use strict';

const { buildExternalHelpers } = require('babel-core');
const { uniqueMatch } = require('../../utils/string');
const replaceEnvironment = require('./replaceEnvironment');

const RE_HELPER = /babelHelpers\.([a-zA-Z]+)\(/gm;
const RE_LAST_MODULE_DECLARATION = /\$m\['([^']+)'\]\s=\s(?=[^$m\[]*$)/;
const RE_STRICT = /'use strict';?\s?/g;
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
  const dependencies = file.getAllDependencies();
  let contentString = `${header}\n`;
  let hasStrict = RE_STRICT.test(file.content);
  let pendingContent = [];

  // Add require boilerplate
  if (boilerplate) {
    contentString += browser
      // Replace process.env.NODE_ENV
      ? replaceEnvironment(REQUIRE_BOILERPLATE)
      : REQUIRE_NODE_BOILERPLATE;
  }

  // Add wrapper open
  if (browser) {
    pendingContent.push(bootstrap
      ? '(function () {'
      : `$m['${file.id}'] = function () {`
    );
  }

  // Add dependencies
  pendingContent.push(...dependencies.map((dependency) => {
    let dependencyContent = dependency.isBuddyBuilt
      ? dependency.content
      : wrap(dependency, dependency.isCircularDependency) + '\n';

    if (RE_STRICT.test(dependencyContent)) hasStrict = true;

    return dependencyContent;
  }));

  // Add file contents
  pendingContent.push(wrap(file, false));

  // Add wrapper close
  if (browser) {
    pendingContent.push(`}${bootstrap ? ')()' : ''}`);
  }

  let pendingContentString = pendingContent.join('\n');

  if (hasStrict) pendingContentString = pendingContentString.replace(RE_STRICT, '');

  // Add helpers
  if (helpers) {
    const helpers = uniqueMatch(pendingContentString, RE_HELPER).map((item) => item.match);

    if (helpers.length) contentString += `\n\n${buildExternalHelpers(helpers)}`;
  }

  return `${hasStrict ? "'use strict';\n\n" : ''}${contentString}\n\n${pendingContentString}`;
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