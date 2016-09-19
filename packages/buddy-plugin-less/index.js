'use strict';

const less = require('less');

const FILE_EXTENSIONS = ['less'];
const WORKFLOW_WRITE = [
  'bundle:inline',
  'compile',
  'compress:compress'
];

module.exports = {
  name: 'less',
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

  return class LESSFile extends File {
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
      super(id, filepath, options);

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
      less.render(this.content, (err, content) => {
        if (err) return fn(err);
        this.content = content.css;
        debug(`compile: ${strong(this.relpath)}`, 4);
        fn();
      });
    }
  };
}