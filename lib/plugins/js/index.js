'use strict';

const { commentStrip, uniqueMatch } = require('../../utils/string');
const { debug, strong } = require('../../utils/cnsl');
const babelPluginTransformFlatten = require('./babel-plugin-transform-flatten');
const concat = require('./concat');
const flatten = require('./flatten');
const inline = require('./inline');
const replaceEnvironment = require('./replaceEnvironment');
const replaceReferences = require('./replaceReferences');
const sort = require('./sort');
const transpile = require('./transpile');

const FILE_EXTENSIONS = ['js'];
const HEADER = '/** BUDDY BUILT **/';
const RE_BUDDY_BUILT = /^\/\*\* BUDDY BUILT \*\*\//;
const RE_BROWSERIFY_BUILT = /function\(require,\s?module,\s?exports\)/;
const RE_HELPER = /babelHelpers\.([a-zA-Z]+)\(/gm;
const RE_REQUIRE = /require\(['"]([^'"]+)[^)]+\)/g;
const RE_WEBPACK_BUILT = /__we[a-z]ack_require__/;
const WORKFLOW_STANDARD = [
  'isWriteable:sort',
  'replaceEnvironment',
  'bundle:replaceReferences',
  'inline',
  'transpile'
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

      this.workflows.standard.push(WORKFLOW_STANDARD);
      this.workflows.inlineable = [WORKFLOW_INLINEABLE];
      this.workflows.writeable = [WORKFLOW_WRITEABLE];

      this.depth = 0;
      this.isBuddyBuilt = false;
      this.isBuilt = false;
      this.isCircularDependency = false;
      this.isNpmModule = this.options.npmModulepaths
        ? this.options.npmModulepaths.some((modulepath) => ~this.filepath.indexOf(modulepath))
        : false;
      this.transpiled = false;

      if (this.isBuddyBuilt) this.content = concat.unconcat(this);
    }

    /**
     * Retrieve flattened dependency tree
     * @param {Boolean} filtered
     * @returns {Array}
     */
    getAllDependencies (filtered) {
      if (!this.allDependencies) {
        this.allDependencies = sort(this);
      }
      return filtered
        ? this.allDependencies.filter((file) => file.type != 'json' && !file.isIgnored)
        : this.allDependencies;
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

        this.isBuddyBuilt = RE_BUDDY_BUILT.test(this.content);
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
     * Sort dependencies
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
    sort (buildOptions, fn) {
      this.getAllDependencies();
      debug(`sort: ${strong(this.relpath)}`, 4);
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
      [...this.getAllDependencies(true), this].forEach((file) => {
        file.content = replaceEnvironment(file.content, buildOptions.browser);
        debug(`replace environment vars: ${strong(file.relpath)}`, 4);
      });
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
     */
    replaceReferences (buildOptions, fn) {
      [...this.getAllDependencies(true), this].forEach((file) => {
        if (file.isBuddyBuilt || file.isBuilt) return;

        file.content = replaceReferences(file.content, file.dependencyReferences, buildOptions.browser);
        debug(`replace dependency references: ${strong(file.relpath)}`, 4);
      });
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
     */
    inline (buildOptions, fn) {
      [...this.getAllDependencies(true), this].forEach((file) => {
        if (file.isBuddyBuilt || file.isBuilt) return;

        file.content = inline(file.content, file.dependencyReferences, buildOptions.browser);
        debug(`inline: ${strong(file.relpath)}`, 4);
      });
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
     */
    transpile (buildOptions, fn) {
      const babelOptions = this.options.pluginOptions.babel;

      [...this.getAllDependencies(true), this].forEach((file) => {
        if (file.transpiled || file.isBuddyBuilt) return;

        let plugins = babelOptions.plugins.slice();

        // Skip pre-built & node_modules files
        if (file.isBuilt || file.isNpmModule) plugins = [];
        // Flatten if bundling
        if (buildOptions.bundle) {
          plugins.push([babelPluginTransformFlatten, {
            // Do not replace 'module.exports' for writeable Node files
            replace: buildOptions.browser ? true : !file.isWriteable(buildOptions.batch),
            source: {
              moduleExports: `$m['${file.id}']`,
              namespace: `_${file.idSafe}_`
            }
          }]);
        }

        const options = Object.assign({}, babelOptions, { plugins });

        try {
          transpile(file, options);

          debug(`transpile: ${strong(file.relpath)}`, 4);
          file.transpiled = true;
        } catch (err) {
          return fn(err);
        }

        // Always parse helpers
        file.helpers = uniqueMatch(file.content, RE_HELPER).map((item) => item.match);
      });

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
      this.depth = 0;
      this.isCircularDependency = false;
      this.transpiled = false;
      super.reset(hard);
    }
  };
}