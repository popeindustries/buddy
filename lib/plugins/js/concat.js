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
  const dependencies = file.getAllDependencies();

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
  dependencies
    // Ignore inlined json
    .filter((dependency) => dependency.type != 'json')
    .forEach((dependency) => {
      let content = [dependency.content];

      // Wrap circular
      if (dependency.isCircularDependency) {
        content.unshift(`$m['${dependency.id}'] = function () {`);
        content.push(`}\n$m['${dependency.id}'].__b__=1;`);
      }
      contents.push(`/*++ ${dependency.relpath} ++*/`, ...content, `/*-- ${dependency.relpath} --*/\n`);
    });

  // Add file contents
  contents.push(`/*++ ${file.relpath} ++*/`, file.content, `/*-- ${file.relpath} --*/`);

  // Add wrapper close
  if (browser) {
    contents.push(bootstrap
      ? '})()'
      : `}\n$m['${file.id}'].__b__=1;`
    );
  }

  return contents.join('\n');
};