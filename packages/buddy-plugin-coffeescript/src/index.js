'use strict';

const coffee = require('coffee-script');

const DEFAULT_OPTIONS = {
  // Compile without function wrapper
  bare: true
};
const FILE_EXTENSIONS = ['coffee'];
const WORKFLOW_STANDARD = [
  '!watchOnly:compile'
];

module.exports = {
  name: 'coffeescript',
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
  const { debug, strong } = utils.cnsl;

  return class COFFEESCRIPTFile extends File {
    /**
     * Constructor
     * @param {String} id
     * @param {String} filepath
     * @param {Object} options
     *  - {Object} caches
     *  - {Object} fileExtensions
     *  - {Function} fileFactory
     *  - {Array} npmModulepaths
     *  - {Object} pluginOptions
     *  - {Object} runtimeOptions
     *  - {Array} sources
     */
    constructor (id, filepath, options) {
      super(id, filepath, options);

      this.workflows.standard[1] = WORKFLOW_STANDARD.concat(this.workflows.standard[1]);
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
     */
    compile (buildOptions, fn) {
      try {
        const options = Object.assign({}, DEFAULT_OPTIONS, this.options.pluginOptions.coffeescript);
        const content = coffee.compile(this.content, options);

        this.content = content;
        debug(`compile: ${strong(this.relpath)}`, 4);
      } catch (err) {
        return fn(err);
      }
      fn();
    }
  };
}