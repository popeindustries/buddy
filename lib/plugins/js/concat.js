'use strict';

const { buildExternalHelpers } = require('babel-core');
const { uniqueMatch } = require('../../utils/string');
const fs = require('fs');
const path = require('path');
const replaceEnvironment = require('./replaceEnvironment');
const sourceMap = require('../../utils/sourceMap');

const DYNAMIC_IMPORT_BOILERPLATE = fs.readFileSync(path.join(__dirname, './dynamic-import.js'), 'utf8');
const REQUIRE_BOILERPLATE = fs.readFileSync(path.join(__dirname, './require.js'), 'utf8');
const RE_HELPER = /babelHelpers\.([a-zA-Z]+)\(/gm;
const RE_LAST_MODULE_DECLARATION = /\$m\['([^']+)'\]\s=\s(?=[^$m\[]*$)/;
const RE_WRAP_CLOSE = /\s}\)\(\)\s?$/;
const RE_WRAP_OPEN = /([\s\S]+?)\/\*==/;

/**
 * Concatenate dependency content for 'file'
 * @param {JSFile} file
 * @param {String} headerComment
 * @param {Object} buildOptions
 *  - {Boolean} bootstrap
 *  - {Boolean} boilerplate
 *  - {Boolean} browser
 *  - {Boolean} bundle
 *  - {Boolean} compress
 *  - {Array} ignoredFiles
 *  - {Boolean} helpers
 *  - {Boolean} watchOnly
 */
module.exports = function concat (file, headerComment, buildOptions) {
  const { boilerplate, bootstrap, browser, helpers, importBoilerplate } = buildOptions;
  const dependencies = file.getAllDependencies();
  const content = file.content;
  const map = file.hasMaps ? file.map.toJSON() : {};
  const totalLines = file.totalLines;
  let headerContent = `'use strict';\n\n${headerComment}\n\n`;

  // Reset
  file.content = '';
  if (file.hasMaps) file.map = sourceMap.create('', file.relUrl);
  file.totalLines = 0;

  // Add boilerplate
  if (boilerplate) {
    // Replace process.env.*
    headerContent += `${replaceEnvironment(REQUIRE_BOILERPLATE, browser)}\n`;
  }
  if (importBoilerplate) {
    // Replace process.env.*
    headerContent += `${replaceEnvironment(DYNAMIC_IMPORT_BOILERPLATE, browser)}\n`;
  }

  // Add wrapper open
  if (browser) {
    file.appendContent(bootstrap ? '(function () {' : `$m['${file.id}'] = function () {`);
  }

  // Add dependencies
  dependencies.forEach((dependency) => {
    if (!dependency.isBuddyBuilt) {
      const [header, footer] = wrap(dependency, dependency.isCircularDependency);

      dependency.prependContent(header);
      dependency.appendContent(footer);
    }
    file.appendContent(dependency);
    file.appendContent('\n');
  });

  // Add file contents
  const [header, footer] = wrap(file, false);

  file.appendContent(header);
  // Manually re-apply reset
  file.content += `\n${content}`;
  if (file.hasMaps) sourceMap.append(file.map, sourceMap.createFromMap(map, file.fileContent, file.relUrl), file.totalLines);
  file.totalLines += totalLines;
  file.appendContent(footer);

  // Add wrapper close
  if (browser) file.appendContent(`}${bootstrap ? ')()' : ''}`);

  // Add helpers
  if (helpers) {
    const helpers = uniqueMatch(file.content, RE_HELPER).map((item) => item.match);

    if (helpers.length) headerContent += `${buildExternalHelpers(helpers)}\n`;
  }

  file.prependContent(headerContent);
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
 * @returns {Array}
 */
function wrap (file, isCircularDependency) {
  const header = `/*== ${file.relpath} ==*/\n`
    + `$m['${file.id}'] = ${isCircularDependency ? 'function () {\n$m[\'' + file.id + '\'] = ' : ''}{ exports: {} };`;
  const footer = `${isCircularDependency ? '};\n' : ''}/*≠≠ ${file.relpath} ≠≠*/`;

  return [header, footer];
}