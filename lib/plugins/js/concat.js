'use strict';

const { buildExternalHelpers } = require('babel-core');
const { SourceMapConsumer, SourceNode } = require('source-map');
const { uniqueMatch } = require('../../utils/string');
const fs = require('fs');
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
 * @returns {SourceNode}
 */
module.exports = function concat (file, header, buildOptions) {
  const { boilerplate, bootstrap, browser, helpers, importBoilerplate } = buildOptions;
  const dependencies = file.getAllDependencies();
  const map = new SourceNode();
  let content = '';
  let headerContent = `'use strict';\n\n${header}\n\n`;

  // Add boilerplate
  if (boilerplate) {
    // Replace process.env.*
    headerContent += `${replaceEnvironment(REQUIRE_BOILERPLATE, browser)}\n`;
  }
  if (importBoilerplate) {
    // Replace process.env.*
    headerContent += `${replaceEnvironment(DYNAMIC_IMPORT_BOILERPLATE, browser)}\n`;
  }
  headerContent += '\n\n';

  // Add wrapper open
  if (browser) {
    content = add(bootstrap ? '(function () {\n' : `$m['${file.id}'] = function () {\n`, content, map);
  }

  // Add dependencies
  dependencies.forEach((dependency) => {
    if (!dependency.isBuddyBuilt) wrap(dependency, dependency.isCircularDependency);
    content = add(dependency, content, map);
    content = add('\n\n', content, map);
  });

  // Add file contents
  wrap(file, false);
  content = add(file, content, map);

  // Add wrapper close
  if (browser) content = add(`\n}${bootstrap ? ')()' : ''}`, content, map);

  // Add helpers
  if (helpers) {
    const helpers = uniqueMatch(content, RE_HELPER).map((item) => item.match);

    if (helpers.length) headerContent += `${buildExternalHelpers(helpers)}\n\n`;
  }

  content = prepend(headerContent, content, map);

  return { content, map };
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

  file.content = prepend(`${header}\n`, file.content, file.map);
  file.content = add(`\n${footer}`, file.content, file.map);
}

/**
 * Add 'chunk' to 'content' and 'map'
 * @param {String|File} chunk
 * @param {String} content
 * @param {SourceNode} map
 * @returns {String}
 */
function add (chunk, content, map) {
  if ('string' == typeof chunk) {
    content += chunk;
    map.add(chunk);
  } else {
    content += chunk.content;
    map.add(chunk.map);
  }
  return content;
}

/**
 * Prepend 'chunk' to 'content' and 'map'
 * @param {String|File} chunk
 * @param {String} content
 * @param {SourceNode} map
 * @returns {String}
 */
function prepend (chunk, content, map) {
  if ('string' == typeof chunk) {
    content = chunk + content;
    map.prepend(chunk);
  } else {
    content = chunk.content + content;
    map.prepend(chunk.map);
  }
  return content;
}