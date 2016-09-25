'use strict';

const { commentStrip, uniqueMatch } = require('../../utils/string');
const { debug, strong } = require('../../utils/cnsl');
const concat = require('./concat');
const flatten = require('./flatten');
const inline = require('./inline');
const replaceEnvironment = require('./replaceEnvironment');
const replaceReferences = require('./replaceReferences');
const transpile = require('./transpile');

const FILE_EXTENSIONS = ['js'];
const RE_REQUIRE = /require\(['"]([^'"]+)[^)]+\)/g;
const WORKFLOW_STANDARD = [
  'runWorkflowForDependencies',
  '!watchOnly:browser:replaceEnvironment',
  '!watchOnly:bundle:replaceReferences',
  '!watchOnly:inline',
  '!watchOnly:transpile',
  '!watchOnly:bundle:flatten'
];
const WORKFLOW_INLINEABLE = [
  'load',
  'replaceEnvironment',
  'compress:compress'
];
const WORKFLOW_WRITEABLE = [
  'bundle:concat',
  'compress:compress'
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
 * @param {Object} utils
 * @returns {Class}
 */
function define (File, utils) {
  return class JSFile extends File {
    /**
     * Constructor
     * @param {String} id
     * @param {String} filepath
     * @param {Object} options
     *  - {Object} caches
     *  - {Object} fileExtensions
     *  - {Function} fileFactory
     *  - {Object} pluginOptions
     *  - {Object} runtimeOptions
     *  - {Array} sources
     */
    constructor (id, filepath, options) {
      super(id, filepath, 'js', options);

      this.workflows.standard[1] = WORKFLOW_STANDARD;
      this.workflows.inlineable = [WORKFLOW_INLINEABLE];
      this.workflows.writeable = [WORKFLOW_WRITEABLE];

      this.ast = null;
    }

    /**
     * Parse file contents for dependency references
     * @param {Object} buildOptions
     *  - {Boolean} bootstrap
     *  - {Boolean} boilerplate
     *  - {Boolean} browser
     *  - {Boolean} bundle
     *  - {Boolean} compress
     *  - {Array} ignoredFiles
     *  - {Boolean} helpers
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
     *  - {Boolean} browser
     *  - {Boolean} bundle
     *  - {Boolean} compress
     *  - {Array} ignoredFiles
     *  - {Boolean} helpers
     *  - {Boolean} watchOnly
     * @param {Function} fn(err)
     */
    replaceEnvironment (buildOptions, fn) {
      this.content = replaceEnvironment(this.content);
      debug(`replace environment vars: ${strong(this.relpath)}`, 4);
      fn();
    }

    /**
     * Replace relative dependency references with fully resolved
     * @param {Object} buildOptions
     *  - {Boolean} bootstrap
     *  - {Boolean} boilerplate
     *  - {Boolean} browser
     *  - {Boolean} bundle
     *  - {Boolean} compress
     *  - {Array} ignoredFiles
     *  - {Boolean} helpers
     *  - {Boolean} watchOnly
     * @param {Function} fn(err)
     */
    replaceReferences (buildOptions, fn) {
      this.content = replaceReferences(this.content, this.dependencyReferences);
      debug(`replace dependency references: ${strong(this.relpath)}`, 4);
      fn();
    }

    /**
     * Inline json/disabled dependency content
     * @param {Object} buildOptions
     *  - {Boolean} bootstrap
     *  - {Boolean} boilerplate
     *  - {Boolean} browser
     *  - {Boolean} bundle
     *  - {Boolean} compress
     *  - {Array} ignoredFiles
     *  - {Boolean} helpers
     *  - {Boolean} watchOnly
     * @param {Function} fn(err)
     */
    inline (buildOptions, fn) {
      this.content = inline(this.content, this.dependencyReferences, buildOptions.browser);
      debug(`inline: ${strong(this.relpath)}`, 4);
      fn();
    }

    /**
     * Transpile file contents
     * @param {Object} buildOptions
     *  - {Boolean} bootstrap
     *  - {Boolean} boilerplate
     *  - {Boolean} browser
     *  - {Boolean} bundle
     *  - {Boolean} compress
     *  - {Array} ignoredFiles
     *  - {Boolean} helpers
     *  - {Boolean} watchOnly
     * @param {Function} fn(err)
     */
    transpile (buildOptions, fn) {
      try {
        transpile(this, this.options.pluginOptions.babel);

        debug(`transpile: ${strong(this.relpath)}`, 4);
        fn();
      } catch (err) {
        fn(err);
      }
    }

    /**
     * Flatten file scope
     * @param {Object} buildOptions
     *  - {Boolean} bootstrap
     *  - {Boolean} boilerplate
     *  - {Boolean} browser
     *  - {Boolean} bundle
     *  - {Boolean} compress
     *  - {Array} ignoredFiles
     *  - {Boolean} helpers
     *  - {Boolean} watchOnly
     * @param {Function} fn(err)
     */
    flatten (buildOptions, fn) {
      try {
        flatten(this);

        debug(`flatten: ${strong(this.relpath)}`, 4);
        fn();
      } catch (err) {
        fn(err);
      }
    }

    /**
     * Concatenate file contents
     * @param {Object} buildOptions
     *  - {Boolean} bootstrap
     *  - {Boolean} boilerplate
     *  - {Boolean} browser
     *  - {Boolean} bundle
     *  - {Boolean} compress
     *  - {Array} ignoredFiles
     *  - {Boolean} helpers
     *  - {Boolean} watchOnly
     * @param {Function} fn(err)
     */
    concat (buildOptions, fn) {
      this.content = concat(this, buildOptions);
      debug(`concat: ${strong(this.relpath)}`, 4);
      fn();
    }

    /**
     * Reset content
     * @param {Boolean} hard
     */
    reset (hard) {
      this.ast = null;
      super.reset(hard);
    }
  };
}