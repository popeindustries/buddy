'use strict';

const { buildExternalHelpers } = require('babel-core');
const fs = require('fs');
const path = require('path');
const replaceEnvironment = require('./replaceEnvironment');

const REQUIRE_BOILERPLATE = fs.readFileSync(path.resolve(__dirname, './require.js'), 'utf8');
const REQUIRE_NODE_BOILERPLATE = fs.readFileSync(path.resolve(__dirname, './requireNode.js'), 'utf8');

/**
 * Concatenate dependency content for 'file'
 * @param {JSFile} file
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
module.exports = function concat (file, buildOptions) {
  const { boilerplate, bootstrap, browser, helpers } = buildOptions;
  const contents = [];
  // Ignore inlined json
  const dependencies = file.getAllDependencies()
    .filter((dependency) => dependency.type != 'json');

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