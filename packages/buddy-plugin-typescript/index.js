'use strict';

const ts = require('typescript');

const DEFAULT_COMPILER_OPTIONS = {
  module: ts.ModuleKind.CommonJS
};
const FILE_EXTENSIONS = ['ts', 'tsx'];

module.exports = {
  name: 'typescript',
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
  const { debug, error, strong } = utils.cnsl;
  const { sourceMapCommentStrip } = utils.string;

  return class TYPESCRIPTFile extends File {
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
     * @returns {null}
     */
    compile (buildOptions, fn) {
      try {
        const compilerOptions = Object.assign(
          this.hasMaps ? { sourceMap: true, inlineSourceMap: false } : {},
          DEFAULT_COMPILER_OPTIONS,
          (this.options.pluginOptions.typescript && this.options.pluginOptions.typescript.compilerOptions) || {}
        );
        const options = {
          fileName: this.relpath,
          compilerOptions
        };
        const result = ts.transpileModule(this.content, options);

        this.setContent(sourceMapCommentStrip(result.outputText));
        if (result.sourceMapText) this.setMap(result.sourceMapText);
        debug(`compile: ${strong(this.relpath)}`, 4);
      } catch (err) {
        if (!this.options.runtimeOptions.watch) return fn(err);
        error(err, 4, false);
      }
      fn();
    }
  };
}