'use strict';

const { SourceMapConsumer, SourceMapGenerator } = require('source-map');
const stylus = require('stylus');

const FILE_EXTENSIONS = ['styl'];
const WORKFLOW_WRITEABLE = [
  'inline',
  'compile',
  'transpile'
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
  const { debug, error, strong } = utils.cnsl;

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
      const style = stylus(this.content)
        .set('filename', this.relpath)
        .set('sourcemap', { comment: false })
        // Gather all source directories
        .set('paths', this.options.fileCache.getDirs());

      if (this.options.pluginOptions.stylus) {
        for (const option in this.options.pluginOptions.stylus) {
          style.set(option, this.options.pluginOptions.stylus[option]);
        }
      }

      style.render((err, css) => {
        if (err) {
          if (!this.options.runtimeOptions.watch) return fn(err);
          error(err, 4, false);
        }

        this.map = SourceMapGenerator.fromSourceMap(new SourceMapConsumer(style.sourcemap));
        this.map.setSourceContent(this.relpath, this.content);
        this.content = css;
        debug(`compile: ${strong(this.relpath)}`, 4);
        fn();
      });
    }
  };
}