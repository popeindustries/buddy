'use strict';

const MagicString = require('magic-string');
const ts = require('typescript');

const DEFAULT_OPTIONS = {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS
  }
};
const FILE_EXTENSIONS = ['ts', 'tsx'];

module.exports = {
  name: 'typescript',
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
  const { debug, error, strong } = utils.cnsl;

  return class TYPESCRIPTFile extends File {
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
      super(id, filepath, options);

      this.compiled = false;
    }

    /**
     * Compile file contents
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
    compile (buildOptions, fn) {
      if (this.compiled) return fn();

      try {
        const options = Object.assign({}, DEFAULT_OPTIONS, this.options.pluginOptions.typescript);
        const result = ts.transpileModule(this.content, options);

        this.content = result.outputText;
        this.compiled = true;
        debug(`compile: ${strong(this.relpath)}`, 4);
      } catch (err) {
        if (!this.options.runtimeOptions.watch) return fn(err);
        error(err, 4, false);
      }
      fn();
    }

    /**
     * Reset content
     * @param {Boolean} hard
     */
    reset (hard) {
      if (hard) this.compiled = false;
      super.reset(hard);
    }
  };
}