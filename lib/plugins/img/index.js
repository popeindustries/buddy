'use strict';

const FILE_EXTENSIONS = ['gif', 'jpg', 'jpeg', 'png', 'svg'];
const WORKFLOW_WRITEABLE = [
  'compress:compress'
];

module.exports = {
  name: 'img',
  type: 'img',

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
  return class IMGFile extends File {
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
      super(id, filepath, 'img', options);

      this.workflows.writeable = [WORKFLOW_WRITEABLE];
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
      // Make sure to load as Buffer
      if (this.extension != 'svg') this.encoding = null;
      super.load(buildOptions, fn);
    }
  };
}