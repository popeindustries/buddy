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
const HEADER = '/** BUDDY BUILT **/';
const RE_BROWSERIFY_BUILT = /function\(require,\s?module,\s?exports\)|__webpack_require__/;
const RE_HELPER = /babelHelpers\.([a-zA-Z]+)\(/gm;
const RE_REQUIRE = /require\(['"]([^'"]+)[^)]+\)/g;
const RE_WEBPACK_BUILT = /__webpack_require__/;
const WORKFLOW_STANDARD = [
  'runWorkflowForDependencies',
  '!watchOnly:replaceEnvironment',
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
     *  - {Object} globalAliases
     *  - {Array} npmModulepaths
     *  - {Object} pluginOptions
     *  - {Object} runtimeOptions
     */
    constructor (id, filepath, options) {
      super(id, filepath, 'js', options);

      this.workflows.standard[1] = WORKFLOW_STANDARD;
      this.workflows.inlineable = [WORKFLOW_INLINEABLE];
      this.workflows.writeable = [WORKFLOW_WRITEABLE];

      this.ast = null;
      this.isBuddyBuilt = false;
      this.isBuilt = false;
      this.isNpmModule = this.options.npmModulepaths
        ? this.options.npmModulepaths.some((modulepath) => ~this.filepath.indexOf(modulepath))
        : false;
      this.transpiled = false;
      this.flattened = false;

      if (this.isBuddyBuilt) this.content = concat.unconcat(this);
    }

    /**
     * Read and store file contents
     * @param {Object} buildOptions
     *  - {Boolean} batch
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
    load (buildOptions, fn) {
      super.load(buildOptions, (err) => {
        if (err && fn) return fn(err);

        this.isBuddyBuilt = this.content.indexOf(HEADER) >= 0;
        this.isBuilt = RE_BROWSERIFY_BUILT.test(this.content) || RE_WEBPACK_BUILT.test(this.content);
        if (this.isBuddyBuilt) this.content = concat.unwrap(this, buildOptions);

        if (fn) fn();
      });

    }

    /**
     * Parse file contents for dependency references
     * @param {Object} buildOptions
     *  - {Boolean} batch
     *  - {Boolean} bootstrap
     *  - {Boolean} boilerplate
     *  - {Boolean} browser
     *  - {Boolean} bundle
     *  - {Boolean} compress
     *  - {Array} ignoredFiles
     *  - {Boolean} helpers
     *  - {Boolean} watchOnly
     * @param {Function} fn(err)
     * @returns {null}
     */
    parse (buildOptions, fn) {
      if (this.isBuddyBuilt || this.isBuilt) return fn();

      const content = commentStrip(this.content);

      super.addDependencies(uniqueMatch(content, RE_REQUIRE)
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
     *  - {Boolean} batch
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
      this.content = replaceEnvironment(this.content, buildOptions.browser);
      debug(`replace environment vars: ${strong(this.relpath)}`, 4);
      fn();
    }

    /**
     * Replace relative dependency references with fully resolved
     * @param {Object} buildOptions
     *  - {Boolean} batch
     *  - {Boolean} bootstrap
     *  - {Boolean} boilerplate
     *  - {Boolean} browser
     *  - {Boolean} bundle
     *  - {Boolean} compress
     *  - {Array} ignoredFiles
     *  - {Boolean} helpers
     *  - {Boolean} watchOnly
     * @param {Function} fn(err)
     * @returns {null}
     */
    replaceReferences (buildOptions, fn) {
      if (this.isBuddyBuilt || this.isBuilt) return fn();

      this.content = replaceReferences(this.content, this.dependencyReferences, buildOptions.browser);
      debug(`replace dependency references: ${strong(this.relpath)}`, 4);
      fn();
    }

    /**
     * Inline json/disabled dependency content
     * @param {Object} buildOptions
     *  - {Boolean} batch
     *  - {Boolean} bootstrap
     *  - {Boolean} boilerplate
     *  - {Boolean} browser
     *  - {Boolean} bundle
     *  - {Boolean} compress
     *  - {Array} ignoredFiles
     *  - {Boolean} helpers
     *  - {Boolean} watchOnly
     * @param {Function} fn(err)
     * @returns {null}
     */
    inline (buildOptions, fn) {
      if (this.isBuddyBuilt || this.isBuilt) return fn();

      this.content = inline(this.content, this.dependencyReferences, buildOptions.browser);
      debug(`inline: ${strong(this.relpath)}`, 4);
      fn();
    }

    /**
     * Transpile file contents
     * @param {Object} buildOptions
     *  - {Boolean} batch
     *  - {Boolean} bootstrap
     *  - {Boolean} boilerplate
     *  - {Boolean} browser
     *  - {Boolean} bundle
     *  - {Boolean} compress
     *  - {Array} ignoredFiles
     *  - {Boolean} helpers
     *  - {Boolean} watchOnly
     * @param {Function} fn(err)
     * @returns {null}
     */
    transpile (buildOptions, fn) {
      // Skip pre-built & node_modules files
      if (!this.transpiled && !this.isBuddyBuilt && !this.isBuilt && !this.isNpmModule) {
        try {
          transpile(this, this.options.pluginOptions.babel);

          debug(`transpile: ${strong(this.relpath)}`, 4);
          this.transpiled = true;
        } catch (err) {
          return fn(err);
        }
      }

      // Always parse helpers
      this.helpers = uniqueMatch(this.content, RE_HELPER).map((item) => item.match);

      fn();
    }

    /**
     * Flatten file scope
     * @param {Object} buildOptions
     *  - {Boolean} batch
     *  - {Boolean} bootstrap
     *  - {Boolean} boilerplate
     *  - {Boolean} browser
     *  - {Boolean} bundle
     *  - {Boolean} compress
     *  - {Array} ignoredFiles
     *  - {Boolean} helpers
     *  - {Boolean} watchOnly
     * @param {Function} fn(err)
     * @returns {null}
     */
    flatten (buildOptions, fn) {
      // Built files should be flattened
      if (this.flattened || this.isBuddyBuilt) return fn();

      try {
        // Do not replace 'module.exports' for writeable Node files
        flatten(this, buildOptions.browser ? true : !this.isWriteable(buildOptions.batch));

        debug(`flatten: ${strong(this.relpath)}`, 4);
        this.flattened = true;
      } catch (err) {
        return fn(err);
      }

      fn();
    }

    /**
     * Concatenate file contents
     * @param {Object} buildOptions
     *  - {Boolean} batch
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
      this.content = concat(this, HEADER, buildOptions);
      debug(`concat: ${strong(this.relpath)}`, 4);
      fn();
    }

    /**
     * Reset content
     * @param {Boolean} hard
     */
    reset (hard) {
      this.ast = null;
      this.flattened = false;
      this.transpiled = false;
      super.reset(hard);
    }
  };
}