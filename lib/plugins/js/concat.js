'use strict';

const { buildExternalHelpers } = require('babel-core');
const { SourceNode } = require('source-map');
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
  const map = new SourceNode();
  let footerItems = [];
  let hasStrict = RE_STRICT.test(file.content);
  let headerString = `${header}\n`;

  // Add boilerplate
  if (boilerplate) {
    // Replace process.env.*
    headerString += `${replaceEnvironment(REQUIRE_BOILERPLATE, browser)}\n`;
  }
  if (importBoilerplate) {
    // Replace process.env.*
    headerString += `${replaceEnvironment(DYNAMIC_IMPORT_BOILERPLATE, browser)}\n`;
  }

  // Add wrapper open
  if (browser) {
    footerItems.push(bootstrap
      ? '(function () {'
      : `$m['${file.id}'] = function () {`
    );
  }

  // Add dependencies
  dependencies.forEach((dependency) => {
    const dependencyContent = dependency.isBuddyBuilt
      ? [dependency]
      : wrap(dependency, dependency.isCircularDependency);

    if (RE_STRICT.test(dependency.content)) hasStrict = true;

    footerItems.push(...dependencyContent);
  });

  // Add file contents
  footerItems.push(...wrap(file, false));

  // Add wrapper close
  if (browser) footerItems.push(`}${bootstrap ? ')()' : ''}`);

  let footerString = footerItems.reduce((footerString, item) => {
    footerString += `${('string' == typeof item) ? item : item.content}\n`;
    map.add([('string' == typeof item) ? item : item.map]);

    return footerString;
  }, '');

  if (hasStrict) {
    footerString = footerString.replace(RE_STRICT, '');
    map.replaceRight(RE_STRICT, '');
    headerString = "'use strict';\n\n" + headerString;
  }

  // Add helpers
  if (helpers) {
    const helpers = uniqueMatch(footerString, RE_HELPER).map((item) => item.match);

    if (helpers.length) headerString += `\n\n${buildExternalHelpers(helpers)}`;
  }

  // map.prepend(`${headerString}\n\n`);

  return {
    // content: `${headerString}\n\n${footerString}`,
    content: footerString,
    map
  };
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
 * @returns {Array}
 */
function wrap (file, isCircularDependency) {
  const header = `/*== ${file.relpath} ==*/\n`
    + `$m['${file.id}'] = ${isCircularDependency ? 'function () {\n$m[\'' + file.id + '\'] = ' : ''}{ exports: {} };`;
  const footer = `${isCircularDependency ? '};\n' : ''}/*≠≠ ${file.relpath} ≠≠*/`;

  return [header, file, footer];
}