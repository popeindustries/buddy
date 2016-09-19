'use strict';

const stylus = require('stylus');

const FILE_EXTENSIONS = ['styl'];
const WORKFLOW_WRITE = [
  'bundle:inline',
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
     *  - {Object} fileExtensions
     *  - {Function} fileFactory
     *  - {Object} runtimeOptions
     *  - {Array} sources
     */
    constructor (id, filepath, options) {
      super(id, filepath, 'css', options);

      this.workflows.write = WORKFLOW_WRITE;
    }

    /**
     * Compile file contents
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
    compile (buildOptions, fn) {
      stylus.render(this.content, {}, (err, content) => {
        if (err) return fn(err);
        this.content = content;
        debug(`compile: ${strong(this.relpath)}`, 4);
        fn();
      });
    }
  };
}