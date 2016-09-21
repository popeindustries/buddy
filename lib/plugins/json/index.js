'use strict';

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
     *  - {Object} fileExtensions
     *  - {Function} fileFactory
     *  - {Object} runtimeOptions
     *  - {Array} sources
     */
    constructor (id, filepath, options) {
      super(id, filepath, 'json', options);

      this.workflows.standard = [WORKFLOW_STANDARD];
      // No processing required
      this.workflows.inlineable = [[]];
    }
  };
}