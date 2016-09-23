'use strict';

const { buildExternalHelpers } = require('babel-core');
const fs = require('fs');
const path = require('path');
const replaceEnvironment = require('./replaceEnvironment');

const REQUIRE_BOILERPLATE = fs.readFileSync(path.resolve(__dirname, './require.js'), 'utf8');

/**
 * Concatenate dependency content for 'file'
 * @param {JSFile} file
 * @param {Object} buildOptions
 *  - {Boolean} bootstrap
 *  - {Boolean} boilerplate
 *  - {Boolean} bundle
 *  - {Boolean} compress
 *  - {Array} ignoredFiles
 *  - {Boolean} includeHeader
 *  - {Boolean} includeHelpers
 *  - {Boolean} watchOnly
 * @returns {String}
 */
module.exports = function concat (file, buildOptions) {
  const contents = [];
  const dependencies = file.getAllDependencies();

  // Add require boilerplate (replace process.env.NODE_ENV)
  if (buildOptions.boilerplate) contents.push(replaceEnvironment(REQUIRE_BOILERPLATE));

  // Add helpers
  if (buildOptions.includeHelpers) {
    const helpers = buildExternalHelpers(file.getAllHelpers());

    if (helpers) contents.push(helpers);
  }

  // Add wrapper open
  contents.push(buildOptions.bootstrap
    ? '!(function () {'
    : `$m[${file.id}] = function () {`
  );

  // Add dependencies
  dependencies
    // Ignore inlined json
    .filter((dependency) => dependency.type != 'json')
    .forEach((dependency) => {
      contents.push(`/*== ${dependency.relpath} ==*/`, `$m[${dependency.id}] = {};`, `${dependency.content}\n`);
    });

  // Add file contents
  contents.push(`/*== ${file.relpath} ==*/`, `$m[${file.id}] = {};`, file.content);

  // Add wrapper close
  contents.push(buildOptions.bootstrap
    ? '})()'
    : `}\n$m[${file.id}].__b__=1;`
  );

  return contents.join('\n');
};

/*
require
helpers
!(function () {
  // filepath comment
  $m[id] = {};
  content
})()
*/

/*
require
helpers
$m[id] = function () {
  // filepath comment
  $m[id] = {};
  content
}
$m[id].__b__ = 1;
*/