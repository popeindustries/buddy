'use strict';

const { commentStrip, uniqueMatch } = require('../utils/string');
const { debug, strong } = require('../utils/cnsl');
const { regexpEscape } = require('../utils/string');

const ENV_RUNTIME = 'RUNTIME';
const FILE_EXTENSIONS = ['js'];
const RE_REQUIRE = /require\(['"]([^'"]+)[^)]+\)/g;
// Match process.env.FOO, process.env['FOO'], or process.env["FOO"]
const RE_ENV = /process\.env(?:(?:\[['"])|\.)(\w+)(?:['"]\])?/gm;
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
      let content = this.content;
      let matches = {};
      let match;

      // Find all matches
      while (match = RE_ENV.exec(content)) {
        const env = process.env[match[1]];
        // Do not stringify empty values
        let value = (env != undefined)
          ? `'${env}'`
          : env;

        // Force RUNTIME to "browser"
        if (match[1] == ENV_RUNTIME) value = "'browser'";
        // Don't replace if undefined
        if (value) matches[match[0]] = value;
      }

      // Replace all references
      for (const context in matches) {
        // Create new RegExp so that flags work properly
        content = content.replace(new RegExp(regexpEscape(context), 'gm'), matches[context]);
      }

      this.content = content;
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
      let content = this.content;

      this.dependencyReferences.forEach((reference) => {
        let inlineContent = '';

        // Handle disabled
        if (reference.isDisabled) {
          inlineContent = '{}';
        // Inline json
        } else if (reference.file.type == 'json') {
          inlineContent = reference.file.content || '{}';
        }
        // Replace require(*) with inlined content
        if (inlineContent) content = content.replace(new RegExp(regexpEscape(reference.match), 'mg'), inlineContent);
      });

      this.content = content;
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