'use strict';

const { commentStrip, uniqueMatch } = require('../../utils/string');
const { debug, strong } = require('../../utils/cnsl');
const babelPluginTransformFlatten = require('./babel-plugin-transform-flatten');
const concat = require('./concat');
const inline = require('./inline');
const md5 = require('md5');
const replaceEnvironment = require('./replaceEnvironment');
const replaceReferences = require('./replaceReferences');
const sort = require('./sort');
const transpile = require('./transpile');

const FILE_EXTENSIONS = ['js'];
const HEADER = '/** BUDDY BUILT **/';
const RE_BUDDY_BUILT = /^\/\*\* BUDDY BUILT \*\*\//;
const RE_BROWSERIFY_BUILT = /function\(require,\s?module,\s?exports\)/;
// const RE_IMPORT = /import[^'"]+['"]([^'"]+)['"]/g;
const RE_REQUIRE = /require\(['"]([^'"]+)[^)]+\)/g;
const RE_WEBPACK_BUILT = /__we[a-z]ack_require__/;
const WORKFLOW_STANDARD = [
  'compile',
  'isWriteable:sort',
  'replaceEnvironment',
  'transpile',
  'bundle:replaceReferences',
  'inline'
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
     *  - {Object} fileCache
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
      this.transpiledContent = '';
      this.transpiledFingerprint = '';

      if (this.isBuddyBuilt) this.content = concat.unconcat(this);
    }

    /**
     * Retrieve flattened dependency tree
     * @returns {Array}
     */
    getAllDependencies () {
      if (!this.allDependencies) {
        this.allDependencies = sort(this);
      }

      const filteredDependencies = this.getAllDependencyReferences()
        .filter((reference) => {
          return !reference.isIgnored
            && reference.file
            && !reference.file.isLocked
            && reference.file.type != 'json'
            && this.allDependencies.includes(reference.file);
        })
        .map((reference) => reference.file);

      return this.allDependencies.filter((dependency) => filteredDependencies.includes(dependency));
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
      const requires = uniqueMatch(content, RE_REQUIRE);
      // const imports = uniqueMatch(content, RE_IMPORT);

      super.addDependencies(requires
        .map((match) => {
          match.id = match.match;
          return match;
        }),
        buildOptions
      );

      debug(`parse: ${strong(this.relpath)}`, 4);
      fn();
    }

    /**
     * Compile file contents [no-op]
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
    compile (buildOptions, fn) {
      debug(`compile: ${strong(this.relpath)}`, 4);
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
      [...this.getAllDependencies(), this].forEach((file) => {
        file.content = replaceEnvironment(file.content, buildOptions.browser, false);
        debug(`replace environment vars: ${strong(file.relpath)}`, 4);
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
      const babelOptionsFingerprint = this.options.pluginOptions.babelFingerprint;
      const fingerprintableBuildOptions = Object.assign({}, buildOptions);

      delete fingerprintableBuildOptions.ignoredFiles;

      const buildOptionsFingerprint = md5(JSON.stringify(fingerprintableBuildOptions));

      [...this.getAllDependencies(), this].forEach((file) => {
        if (file.isBuddyBuilt) return;

        let plugins = babelOptions.plugins.slice();
        let optionsFingerprint = babelOptionsFingerprint;

        // Skip running Babel plugins on pre-built & node_modules files
        if (file.isBuilt || file.isNpmModule) {
          plugins = [];
          optionsFingerprint = '';
        }
        // Flatten if bundling
        if (buildOptions.bundle) {
          const data = {
            // Do not replace 'module.exports' for writeable Node files
            replace: buildOptions.browser ? true : !file.isWriteable(buildOptions.batch),
            source: {
              moduleExports: `$m['${file.id}']`,
              namespace: `${file.idSafe}__`
            }
          };

          plugins.push([babelPluginTransformFlatten, data]);
          optionsFingerprint += md5(`${data.replace}`);
        }

        const contentFingerprint = md5(JSON.stringify(file.content));
        const options = Object.assign({}, babelOptions, { plugins });
        const transpiledFingerprint = `${contentFingerprint}:${optionsFingerprint}:${buildOptionsFingerprint}`;

        // Skip transpile if same fingerprint as previous
        if (transpiledFingerprint == file.transpiledFingerprint) {
          file.content = file.transpiledContent;
          debug(`[skip] transpile: ${strong(file.relpath)}`, 4);
        } else {
          try {
            const transpiled = transpile(file.filepath, file.content, options);

            debug(`transpile: ${strong(file.relpath)}`, 4);
            file.content = file.transpiledContent = transpiled.content;
          } catch (err) {
            console.log(err)
            return fn(err);
          }
        }

        file.transpiledFingerprint = transpiledFingerprint;
      });

      fn();
    }

    /**
     * Replace process.env.BUDDY* references with values
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
    replaceBuddyEnvironment (buildOptions, fn) {
      [...this.getAllDependencies(), this].forEach((file) => {
        file.content = replaceEnvironment(file.content, buildOptions.browser, true);
        debug(`replace BUDDY* environment vars: ${strong(file.relpath)}`, 4);
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
      [...this.getAllDependencies(), this].forEach((file) => {
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
      [...this.getAllDependencies(), this].forEach((file) => {
        if (file.isBuddyBuilt || file.isBuilt) return;

        file.content = inline(file.content, file.dependencyReferences, buildOptions.browser);
        debug(`inline: ${strong(file.relpath)}`, 4);
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
      this.isBuilt = this.isBuddyBuilt = this.isCircularDependency = false;
      if (hard) {
        this.transpiledContent = '';
        this.transpiledFingerprint = '';
      }
      super.reset(hard);
    }
  };
}