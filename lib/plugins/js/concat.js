'use strict';

const { buildExternalHelpers } = require('babel-core');
const { uniqueMatch } = require('../../utils/string');
const fs = require('fs');
const path = require('path');
const replaceEnvironment = require('./replaceEnvironment');

const DYNAMIC_IMPORT_BOILERPLATE = fs.readFileSync(path.join(__dirname, './dynamic-import.js'), 'utf8');
const REQUIRE_BOILERPLATE = fs.readFileSync(path.join(__dirname, './require.js'), 'utf8');
const RE_HELPER = /babelHelpers\.([a-zA-Z]+)\(/gm;
const RE_LAST_MODULE_DECLARATION = /\$m\['([^']+)'\]\s=\s(?=[^$m\[]*$)/;
const RE_STRICT = /'use strict';?\s?/g;
const RE_WRAP_CLOSE = /\s}\)\(\)\s?$/;
const RE_WRAP_OPEN = /([\s\S]+?)\/\*==/;

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
  const { boilerplate, bootstrap, browser, helpers, importBoilerplate } = buildOptions;
  const dependencies = file.getAllDependencies();
  let contentString = `${header}\n`;
  let hasStrict = RE_STRICT.test(file.content);
  let pendingContent = [];

  // Add boilerplate
  if (boilerplate) {
    // Replace process.env.*
    contentString += `${replaceEnvironment(REQUIRE_BOILERPLATE, browser)}\n`;
  }
  if (importBoilerplate) {
    // Replace process.env.*
    contentString += `${replaceEnvironment(DYNAMIC_IMPORT_BOILERPLATE, browser)}\n`;
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
    const dependencyContent = dependency.isBuddyBuilt
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