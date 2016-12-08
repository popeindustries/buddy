'use strict';

const { debug, error, strong, warn } = require('../../utils/cnsl');
const { resolve } = require('../../resolver');
const babelPluginTransformFlatten = require('./babel-plugin-transform-flatten');
const concat = require('./concat');
const flattenUMD = require('./flattenUMD');
const inline = require('./inline');
const md5 = require('md5');
const parse = require('./parse');
const path = require('path');
const rewriteDirnameFilename = require('./rewriteDirnameFilename');
const replaceDynamicReferences = require('./replaceDynamicReferences');
const replaceEnvironment = require('./replaceEnvironment');
const replaceReferences = require('./replaceReferences');
const sort = require('./sort');
const transpile = require('./transpile');

const FILE_EXTENSIONS = ['js'];
const HEADER = '/** BUDDY BUILT **/';
const RE_BUDDY_BUILT = /^\/\*\* BUDDY BUILT \*\*\//;
const RE_STRICT = /'use strict';?\s?/g;
// Browserify, closure compiler, webpack, etc
const RE_UMD_BUILT = /typeof\sexports\s?===\s?['"]object['"][\s\S]{1,40}module.exports\s?=\s?f/;
const WORKFLOW_STANDARD = [
  'compile',
  'isWriteable:sort',
  'replaceEnvironment',
  'inline',
  'transpile',
  'bundle:reparse',
  // 'rewriteDirnameFilename',
  'bundle:replaceReferences'
];
const WORKFLOW_INLINEABLE = [
  'load',
  'replaceEnvironment',
  'compress:compress'
];
const WORKFLOW_WRITEABLE = [
  'bundle:replaceDynamicReferences',
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
     *  - {Boolean} browser
     *  - {Function} buildFactory
     *  - {FileCache} fileCache
     *  - {Object} fileExtensions
     *  - {Function} fileFactory
     *  - {Array} npmModulepaths
     *  - {Object} pluginOptions
     *  - {ResolverCache} resolverCache
     *  - {Object} runtimeOptions
     *  - {String} webroot
     */
    constructor (id, filepath, options) {
      super(id, filepath, 'js', options);

      /* set via super call:
      this.isBuddyBuilt = false;
      this.isBuilt = false;
      */
      this.workflows.standard.push(WORKFLOW_STANDARD);
      this.workflows.inlineable = [WORKFLOW_INLINEABLE];
      this.workflows.writeable = [WORKFLOW_WRITEABLE];

      this.depth = 0;
      this.dynamicDependencyReferences = [];
      this.isCircularDependency = false;
      this.isNpmModule = this.options.npmModulepaths
        ? this.options.npmModulepaths.some((modulepath) => this.filepath.includes(modulepath))
        : false;
      this.transpiledContent = '';
      this.transpiledFingerprint = '';
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
     * Add dynamic 'dependencies'
     * @param {Array} dependencies
     */
    addDynamicDependencies (dependencies) {
      const { fileFactory } = this.options;
      const resolveOptions = {
        browser: this.options.browser,
        cache: this.options.resolverCache,
        fileExtensions: this.options.fileExtensions
      };

      dependencies.forEach((dependency) => {
        const filepath = resolve(this.filepath, dependency.id, resolveOptions);

        // Unable to resolve filepath or create instance
        if (filepath === '') {
          warn(`dynamic import ${strong(dependency.id)} for ${strong(this.relpath)} not found`, 3);
          return;
        }

        const file = dependency.file = fileFactory(filepath, this.options);

        this.dynamicDependencyReferences.push(dependency);
        if (this.options.buildFactory) this.options.buildFactory(filepath, `${file.idSafe}-%hash%.${file.extension}`);
      });
    }

    /**
     * Read file content
     * @returns {String|Buffer}
     */
    readFileContent () {
      let content = super.readFileContent();

      this.isBuddyBuilt = RE_BUDDY_BUILT.test(content);
      this.isBuilt = RE_UMD_BUILT.test(content);

      if (this.isBuilt) content = flattenUMD(content, `$m['${this.id}']`);
      if (this.isBuddyBuilt) content = concat.unwrap(content, this.id);

      return content;
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
     *  - {Boolean} helpers
     *  - {Array} ignoredFiles
     *  - {Boolean} import
     *  - {Boolean} watchOnly
     * @param {Function} fn(err)
     */
    load (buildOptions, fn) {
      super.load(buildOptions, (err) => {
        if (err) return fn && fn();

        RE_STRICT.lastIndex = 0;
        if (buildOptions && buildOptions.bundle && RE_STRICT.test(this.content)) {
          this.setContent(this.content.replace(RE_STRICT, ''));
        }

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
     *  - {Boolean} helpers
     *  - {Array} ignoredFiles
     *  - {Boolean} import
     *  - {Boolean} watchOnly
     * @param {Function} fn(err)
     * @returns {null}
     */
    parse (buildOptions, fn) {
      if (this.isBuddyBuilt
        || this.isBuilt
        // Don't parse input file dependencies if not bundling
        || (!buildOptions.bundle && this.isDependency)) {
          return fn();
      }

      const [requires, imports, dynamicImports] = parse(this.content);

      this.addDynamicDependencies(dynamicImports);
      super.addDependencies(requires.concat(imports), buildOptions);

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
     *  - {Boolean} helpers
     *  - {Array} ignoredFiles
     *  - {Boolean} import
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
     *  - {Boolean} helpers
     *  - {Array} ignoredFiles
     *  - {Boolean} import
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
     *  - {Boolean} helpers
     *  - {Array} ignoredFiles
     *  - {Boolean} import
     *  - {Boolean} watchOnly
     * @param {Function} fn(err)
     */
    replaceEnvironment (buildOptions, fn) {
      [...this.getAllDependencies(), this].forEach((file) => {
        // Force on server when compressed/deploy
        file.setContent(replaceEnvironment(file.content, buildOptions.compress ? true : buildOptions.browser));
        debug(`replace environment vars: ${strong(file.relpath)}`, 4);
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
     *  - {Boolean} helpers
     *  - {Array} ignoredFiles
     *  - {Boolean} import
     *  - {Boolean} watchOnly
     * @param {Function} fn(err)
     */
    inline (buildOptions, fn) {
      [...this.getAllDependencies(), this].forEach((file) => {
        if (file.isBuddyBuilt || file.isBuilt) return;
        file.setContent(inline(file.content, file.dependencyReferences, buildOptions.browser));
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
     *  - {Boolean} helpers
     *  - {Array} ignoredFiles
     *  - {Boolean} import
     *  - {Boolean} watchOnly
     * @param {Function} fn(err)
     */
    transpile (buildOptions, fn) {
      const babelOptions = this.options.pluginOptions.babel;
      const babelOptionsFingerprint = this.options.pluginOptions.babelFingerprint;
      const fingerprintableBuildOptions = Object.assign({}, buildOptions);
      let errored = false;

      delete fingerprintableBuildOptions.ignoredFiles;

      const buildOptionsFingerprint = md5(JSON.stringify(fingerprintableBuildOptions));

      [...this.getAllDependencies(), this].some((file) => {
        if (file.isBuddyBuilt || file.isBuilt) return;

        const moduleString = `$m['${file.id}']`;
        let plugins = babelOptions.plugins.slice();
        let optionsFingerprint = babelOptionsFingerprint;

        // Skip running Babel plugins on node_modules files
        if (file.isNpmModule) {
          plugins = [];
          optionsFingerprint = '';
        }
        // Flatten if bundling
        if (buildOptions.bundle) {
          const data = {
            // Do not replace 'module.exports' for writeable Node files
            replace: buildOptions.browser ? true : !file.isWriteable(buildOptions.batch),
            source: {
              moduleExports: moduleString,
              namespace: `${file.idSafe}__`
            }
          };

          plugins.push([babelPluginTransformFlatten, data]);
          optionsFingerprint += md5(`${data.replace}`);
        }

        const contentFingerprint = md5(JSON.stringify(file.content));
        const options = Object.assign({}, babelOptions, {
          filename: file.relUrl,
          plugins,
          sourceMaps: file.hasMaps,
          sourceFileName: file.hasMaps ? file.relUrl : null
        });
        const transpiledFingerprint = `${contentFingerprint}:${optionsFingerprint}:${buildOptionsFingerprint}`;

        // Skip transpile if same fingerprint as previous
        if (transpiledFingerprint == file.transpiledFingerprint && file.transpiledContent) {
          file.content = file.transpiledContent;
        } else {
          try {
            if (file.hasMaps) options.inputSourceMap = file.map.toJSON();
            const { code: content, map } = transpile(file.content, options);

            file.transpiledContent = content;
            file.setContent(content);
            if (map) file.setMap(map);
            debug(`transpile: ${strong(file.relpath)}`, 4);
          } catch (err) {
            if (this.options.runtimeOptions.watch) {
              error(err, 4, false);
            } else {
              errored = true;
              fn(err);
            }
            return true;
          }
        }

        file.transpiledFingerprint = transpiledFingerprint;
      });

      if (!errored) fn();
    }

    /**
     * Reparse transpiled file contents to account for possibly removed dependencies
     * @param {Object} buildOptions
     *  - {Boolean} batch
     *  - {Boolean} bootstrap
     *  - {Boolean} boilerplate
     *  - {Boolean} browser
     *  - {Boolean} bundle
     *  - {Boolean} compress
     *  - {Boolean} helpers
     *  - {Array} ignoredFiles
     *  - {Boolean} import
     *  - {Boolean} watchOnly
     * @param {Function} fn(err)
     */
    reparse (buildOptions, fn) {
      [this, ...this.getAllDependencies()].forEach((file) => {
        if (file.isBuddyBuilt || file.isBuilt) return;

        const [requires, imports, dynamicImports] = parse(file.content);
        const referencesById = file.dependencyReferences.reduce((referencesById, dependency) => {
          referencesById[dependency.id] = dependency;
          return referencesById;
        }, {});
        const dynamicReferencesById = file.dynamicDependencyReferences.reduce((dynamicReferencesById, dependency) => {
          dynamicReferencesById[dependency.id] = dependency;
          return dynamicReferencesById;
        }, {});

        file.allDependencies = null;
        file.allDependencyReferences = null;
        file.dependencies = [];
        file.dependencyReferences = [];
        file.dynamicDependencyReferences = [];

        requires.concat(imports).forEach((dependency) => {
          const originalReference = referencesById[dependency.id];

          // Can only have fewer not more references, so compare to original collection and reuse props
          if (originalReference) {
            dependency.isDisabled = originalReference.isDisabled;
            dependency.isIgnored = originalReference.isIgnored;
            file.dependencyReferences.push(dependency);
            if (originalReference.file) {
              dependency.file = originalReference.file;
              dependency.file.depth = 0;
              dependency.file.isCircularDependency = false;
              file.dependencies.push(dependency.file);
            }
          }
        });
        dynamicImports.forEach((dependency) => {
          const originalReference = dynamicReferencesById[dependency.id];

          if (originalReference) {
            dependency.file = originalReference.file;
            file.dynamicDependencyReferences.push(dependency);
          }
        });

        debug(`reparse: ${strong(file.relpath)}`, 4);
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
     *  - {Boolean} helpers
     *  - {Array} ignoredFiles
     *  - {Boolean} import
     *  - {Boolean} watchOnly
     * @param {Function} fn(err)
     */
    rewriteDirnameFilename (buildOptions, fn) {
      [...this.getAllDependencies(), this].forEach((file) => {
        if (file.isBuddyBuilt) return;
        file.setContent(rewriteDirnameFilename(file.content, path.dirname(this.writepath), file.filepath));
        debug(`replace __dirname/__filename references: ${strong(file.relpath)}`, 4);
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
     *  - {Boolean} helpers
     *  - {Array} ignoredFiles
     *  - {Boolean} import
     *  - {Boolean} watchOnly
     * @param {Function} fn(err)
     */
    replaceReferences (buildOptions, fn) {
      [...this.getAllDependencies(), this].forEach((file) => {
        if (file.isBuddyBuilt || file.isBuilt) return;
        file.setContent(replaceReferences(file.content, file.dependencyReferences));
        debug(`replace dependency references: ${strong(file.relpath)}`, 4);
      });
      fn();
    }

    /**
     * Replace dynamic dependency references with fully resolved
     * @param {Object} buildOptions
     *  - {Boolean} batch
     *  - {Boolean} bootstrap
     *  - {Boolean} boilerplate
     *  - {Boolean} browser
     *  - {Boolean} bundle
     *  - {Boolean} compress
     *  - {Boolean} helpers
     *  - {Array} ignoredFiles
     *  - {Boolean} import
     *  - {Boolean} watchOnly
     * @param {Function} fn(err)
     */
    replaceDynamicReferences (buildOptions, fn) {
      [this, ...this.getAllDependencies()].forEach((file) => {
        if (file.isBuilt) return;
        file.setContent(replaceDynamicReferences(file.content, buildOptions.browser, file.dynamicDependencyReferences));
        debug(`replace dynamic dependency references: ${strong(file.relpath)}`, 4);
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
     *  - {Boolean} helpers
     *  - {Array} ignoredFiles
     *  - {Boolean} import
     *  - {Boolean} watchOnly
     * @param {Function} fn(err)
     */
    concat (buildOptions, fn) {
      concat(this, HEADER, buildOptions);
      debug(`concat: ${strong(this.relpath)}`, 4);
      fn();
    }

    /**
     * Reset content
     * @param {Boolean} hard
     */
    reset (hard) {
      super.reset(hard);
      this.depth = 0;
      this.dynamicDependencyReferences = [];
      this.isCircularDependency = false;
      if (hard) {
        this.transpiledContent = '';
        this.transpiledFingerprint = '';
      }
    }
  };
}