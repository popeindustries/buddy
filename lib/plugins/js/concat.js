'use strict';

const { buildExternalHelpers } = require('babel-core');
const { uniqueMatch } = require('../../utils/string');
const fs = require('fs');
const MagicString = require('magic-string');
const path = require('path');
const replaceEnvironment = require('./replaceEnvironment');

const DYNAMIC_IMPORT_BOILERPLATE = fs.readFileSync(path.join(__dirname, './dynamic-import.js'), 'utf8');
const REQUIRE_BOILERPLATE = fs.readFileSync(path.join(__dirname, './require.js'), 'utf8');
const RE_HELPER = /babelHelpers\.([a-zA-Z]+)\(/gm;
const RE_LAST_MODULE_DECLARATION = /\$m\['([^']+)'\]\s=\s(?=[^$m\[]*$)/;
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
 * @returns {MagicString}
 */
module.exports = function concat (file, header, buildOptions) {
  const { boilerplate, bootstrap, browser, helpers, importBoilerplate } = buildOptions;
  const content = new MagicString.Bundle();
  const dependencies = file.getAllDependencies();
  let headerString = `'use strict';\n\n${header}\n\n`;

  // Add boilerplate
  if (boilerplate) {
    // Replace process.env.*
    const boilerplateString = new MagicString(REQUIRE_BOILERPLATE);

    replaceEnvironment(boilerplateString, browser);
    headerString += `${boilerplateString.toString()}\n`;
  }
  if (importBoilerplate) {
    // Replace process.env.*
    const importBoilerplateString = new MagicString(DYNAMIC_IMPORT_BOILERPLATE);

    replaceEnvironment(importBoilerplateString, browser);
    headerString += `${importBoilerplateString.toString()}\n`;
  }
  headerString += '\n\n';

  // Add wrapper open
  if (browser) {
    content.append(bootstrap
      ? '(function () {'
      : `$m['${file.id}'] = function () {`
    );
  }

  // Add dependencies
  dependencies.forEach((dependency) => {
    if (!dependency.isBuddyBuilt) wrap(dependency, dependency.isCircularDependency);
    content.addSource({
      filename: dependency.relpath,
      content: dependency.string
    }).append('\n\n');
  });

  // Add file contents
  wrap(file, false);
  content.addSource({
    filename: file.relpath,
    content: file.string
  });

  // Add wrapper close
  if (browser) content.append(`\n}${bootstrap ? ')()' : ''}`);

  // Add helpers
  if (helpers) {
    const helpers = uniqueMatch(content.toString(), RE_HELPER).map((item) => item.match);

    if (helpers.length) headerString += `${buildExternalHelpers(helpers)}\n\n`;
  }

  content.prepend(headerString);

  return content;
};

/**
 * Undo wrapping of 'content'
 * @param {String} content
 * @param {String} id
 * @returns {String}
 */
module.exports.unwrap = function unwrap (content, id) {
  content = content.replace(RE_WRAP_OPEN, '/*==').replace(RE_WRAP_CLOSE, '');

  const lastModule = RE_LAST_MODULE_DECLARATION.exec(content);

  // Remap module declaration if file id doesn't match bundle entry id
  if (lastModule[1] != id) {
    content = content.replace(lastModule[0], `$m['${id}'] = ${lastModule[0]}`);
  }

  // We can't assume there will be no conflicts, so wrap in closure
  return `(function () {\n${content}\n})()`;
};

/**
 * Wrap 'file' contents
 * @param {File} file
 * @param {Boolean} isCircularDependency
 */
function wrap (file, isCircularDependency) {
  const header = `/*== ${file.relpath} ==*/\n`
    + `$m['${file.id}'] = ${isCircularDependency ? 'function () {\n$m[\'' + file.id + '\'] = ' : ''}{ exports: {} };`;
  const footer = `${isCircularDependency ? '};\n' : ''}/*≠≠ ${file.relpath} ≠≠*/`;

  file.string.prepend(`${header}\n`).append(`\n${footer}`);
}