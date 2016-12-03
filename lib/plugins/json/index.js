'use strict';

const { debug, strong } = require('../../utils/cnsl');

const FILE_EXTENSIONS = ['json'];
const WORKFLOW_STANDARD = ['load'];

module.exports = {
  name: 'json',
  type: 'json',

  /**
   * Register plugin
   * @param {Config} config
   */
  register (config) {
    // Allow json files to be parsed as js also
    config.registerFileExtensionsForType(FILE_EXTENSIONS, 'js');
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
  return class JSONFile extends File {
    /**
     * Constructor
     * @param {String} id
     * @param {String} filepath
     * @param {Object} options
     *  - {Function} buildFactory
     *  - {Object} fileCache
     *  - {Object} fileExtensions
     *  - {Function} fileFactory
     *  - {Array} npmModulepaths
     *  - {Object} pluginOptions
     *  - {Object} runtimeOptions
     *  - {String} webroot
     */
    constructor (id, filepath, options) {
      super(id, filepath, 'json', options);

      this.hasMaps = false;
      this.map = null;
      this.workflows.standard = [WORKFLOW_STANDARD];
      // No processing required
      this.workflows.inlineable = [[]];
    }

    /**
     * Parse file contents for dependency references [no-op]
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
    parse (buildOptions, fn) {
      debug(`parse: ${strong(this.relpath)}`, 4);
      fn();
    }
  };
}