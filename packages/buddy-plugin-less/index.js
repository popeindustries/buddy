'use strict';

const { SourceMapConsumer, SourceMapGenerator } = require('source-map');
const less = require('less');

const DEFAULT_OPTIONS = {
  sourceMap: {}
};
const FILE_EXTENSIONS = ['less'];
const WORKFLOW_WRITEABLE = [
  'inline',
  'compile',
  'transpile'
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
  const { debug, error, strong } = utils.cnsl;

  return class LESSFile extends File {
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
      const options = Object.assign({}, this.options.pluginOptions.less || {}, DEFAULT_OPTIONS);

      less.render(this.content, options, (err, result) => {
        if (err) {
          if (!this.options.runtimeOptions.watch) return fn(err);
          error(err, 4, false);
        }
        this.map = SourceMapGenerator.fromSourceMap(new SourceMapConsumer(result.map));
        this.map.setSourceContent(this.relpath, this.content);
        this.content = result.css;
        debug(`compile: ${strong(this.relpath)}`, 4);
        fn();
      });
    }
  };
}