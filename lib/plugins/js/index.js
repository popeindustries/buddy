'use strict';

const { commentStrip, uniqueMatch } = require('../../utils/string');
const { debug, strong } = require('../../utils/cnsl');
const inline = require('./inline');
const replaceEnvironment = require('./replaceEnvironment');

const FILE_EXTENSIONS = ['js'];
const RE_REQUIRE = /require\(['"]([^'"]+)[^)]+\)/g;
const WORKFLOW_CORE = [
  '!watchOnly:replaceEnvironment',
  '!watchOnly:inline',
  'transpile'
];
const WORKFLOW_INLINE = [
  'load',
  'replaceEnvironment',
  'compress:compress'
];
const WORKFLOW_TRANSPILE = [
  'bundle:namespaceRootDeclarations'
];
const WORKFLOW_WRITE = [
  'bundle:concat',
  'bundle:compress:compress'
];

module.exports = {
  name: 'js',
  type: 'js',

  /**
   * Register plugin
   * @param {Config} config
   */
  register (config) {
    config.registerFileDefinitionAndExtensionsForType(define, FILE_EXTENSIONS, this.type);
  }
};

/**
 * Extend 'File' with new behaviour
 * @param {Class} File
 * @returns {Class}
 */
function define (File) {
  return class JSFile extends File {
    /**
     * Constructor
     * @param {String} id
     * @param {String} filepath
     * @param {Object} options
     *  - {Object} caches
     *  - {Object} fileExtensions
     *  - {Function} fileFactory
     *  - {Object} runtimeOptions
     *  - {Array} sources
     */
    constructor (id, filepath, options) {
      super(id, filepath, 'js', options);

      this.workflows.core = WORKFLOW_CORE;
      this.workflows.inline = WORKFLOW_INLINE;
      this.workflows.write = WORKFLOW_WRITE;
      this.ast = {};
      this.map = {};
    }

    /**
     * Parse file contents for dependency references
     * @param {Object} buildOptions
     *  - {Boolean} bootstrap
     *  - {Boolean} boilerplate
     *  - {Boolean} bundle
     *  - {Boolean} compress
     *  - {Array} ignoredFiles
     *  - {Boolean} includeHeader
     *  - {Boolean} includeHelpers
     *  - {Boolean} watchOnly
     * @param {Function} fn(err)
     */
    parse (buildOptions, fn) {
      super.addDependencies(uniqueMatch(commentStrip(this.content), RE_REQUIRE)
        .map((match) => {
          match.id = match.match;
          return match;
        }),
        buildOptions
      );
      fn();
    }

    /**
     * Replace process.env references with values
     * @param {Object} buildOptions
     *  - {Boolean} bootstrap
     *  - {Boolean} boilerplate
     *  - {Boolean} bundle
     *  - {Boolean} compress
     *  - {Array} ignoredFiles
     *  - {Boolean} includeHeader
     *  - {Boolean} includeHelpers
     *  - {Boolean} watchOnly
     * @param {Function} fn(err)
     */
    replaceEnvironment (buildOptions, fn) {
      this.content = replaceEnvironment(this.content);
      debug(`replace environment vars: ${strong(this.relpath)}`, 4);
      fn();
    }

    /**
     * Inline json/disabled dependency content
     * @param {Object} buildOptions
     *  - {Boolean} bootstrap
     *  - {Boolean} boilerplate
     *  - {Boolean} bundle
     *  - {Boolean} compress
     *  - {Array} ignoredFiles
     *  - {Boolean} includeHeader
     *  - {Boolean} includeHelpers
     *  - {Boolean} watchOnly
     * @param {Function} fn(err)
     */
    inline (buildOptions, fn) {
      this.content = inline(this.content, this.dependencyReferences);
      debug(`inline: ${strong(this.relpath)}`, 4);
      fn();
    }

    /**
     * Transpile file contents
     * @param {Object} buildOptions
     *  - {Boolean} bootstrap
     *  - {Boolean} boilerplate
     *  - {Boolean} bundle
     *  - {Boolean} compress
     *  - {Array} ignoredFiles
     *  - {Boolean} includeHeader
     *  - {Boolean} includeHelpers
     *  - {Boolean} watchOnly
     * @param {Function} fn(err)
     */
    transpile (buildOptions, fn) {
      debug(`transpile: ${strong(this.relpath)}`, 4);
      fn();
    }
  };
}