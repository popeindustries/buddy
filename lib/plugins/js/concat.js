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
 *  - {Boolean} browser
 *  - {Boolean} bundle
 *  - {Boolean} compress
 *  - {Array} ignoredFiles
 *  - {Boolean} helpers
 *  - {Boolean} watchOnly
 * @returns {String}
 */
module.exports = function concat (file, buildOptions) {
  const contents = [];
  const dependencies = file.getAllDependencies();

  // Add require boilerplate (replace process.env.NODE_ENV)
  if (buildOptions.boilerplate) {
    contents.push(replaceEnvironment(REQUIRE_BOILERPLATE));
  } else {
    contents.push('var $m = {};');
  }

  // Add helpers
  if (buildOptions.helpers) {
    const helpers = file.getAllHelpers();

    if (helpers.length) contents.push(buildExternalHelpers(helpers));
  }

  // Add wrapper open
  contents.push(buildOptions.bootstrap
    ? '!(function () {'
    : `$m['${file.id}'] = function () {`
  );

  // Add dependencies
  dependencies
    // Ignore inlined json
    .filter((dependency) => dependency.type != 'json')
    .forEach((dependency) => {
      contents.push(`/*++ ${dependency.relpath} ++*/`, `${dependency.content}`, `/*-- ${dependency.relpath} --*/\n`);
    });

  // Add file contents
  contents.push(`/*++ ${file.relpath} ++*/`, file.content, `/*-- ${file.relpath} --*/`);

  // Add wrapper close
  contents.push(buildOptions.bootstrap
    ? '})()'
    : `}\n$m['${file.id}'].__b__=1;`
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