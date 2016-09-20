'use strict';

const path = require('path');

const FILE_EXTENSIONS = ['gif', 'jpg', 'jpeg', 'png', 'svg'];
const WORKFLOW_WRITE = [
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
     *  - {Object} caches
     *  - {Object} fileExtensions
     *  - {Function} fileFactory
     *  - {Object} pluginOptions
     *  - {Object} runtimeOptions
     *  - {Array} sources
     */
    constructor (id, filepath, options) {
      super(id, filepath, 'img', options);

      this.workflows.write = WORKFLOW_WRITE;
    }

    /**
     * Read and store file contents
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
    load (buildOptions, fn) {
      // Make sure to load as Buffer
      if (this.extension != 'svg') this.encoding = null;
      super.load(buildOptions, fn);
    }
  };
}