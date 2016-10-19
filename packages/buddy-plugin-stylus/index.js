'use strict';

const stylus = require('stylus');

const FILE_EXTENSIONS = ['styl'];
const WORKFLOW_WRITEABLE = [
  'inline',
  'compile',
  'compress:compress'
];

module.exports = {
  name: 'stylus',
  type: 'css',

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

  return class STYLUSFile extends File {
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

      this.workflows.writeable = [WORKFLOW_WRITEABLE];
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
      const options = Object.assign({}, this.options.pluginOptions.stylus, {
        // Gather all source directories
        paths: this.options.fileCache.getDirs()
      });

      stylus.render(this.content, options, (err, content) => {
        if (err) return fn(err);
        this.content = content;
        debug(`compile: ${strong(this.relpath)}`, 4);
        fn();
      });
    }
  };
}