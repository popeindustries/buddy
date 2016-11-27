'use strict';

const { SourceMapConsumer, SourceMapGenerator } = require('source-map');
const ts = require('typescript');

const DEFAULT_COMPILER_OPTIONS = {
  module: ts.ModuleKind.CommonJS,
  sourceMap: true,
  inlineSourceMap: false
};
const FILE_EXTENSIONS = ['ts', 'tsx'];
const RE_SOURCE_MAPPING_URL = /\/\/# sourceMappingURL=[^\s]+/;

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
        const compilerOptions = Object.assign({}, DEFAULT_COMPILER_OPTIONS, (this.options.pluginOptions.typescript && this.options.pluginOptions.typescript.compilerOptions) || {});
        const options = {
          fileName: this.relpath,
          compilerOptions
        };
        const result = ts.transpileModule(this.content, options);

        this.map = SourceMapGenerator.fromSourceMap(new SourceMapConsumer(result.sourceMapText));
        this.map.setSourceContent(this.relpath, this.content);
        this.content = result.outputText.replace(RE_SOURCE_MAPPING_URL, '');
        debug(`compile: ${strong(this.relpath)}`, 4);
      } catch (err) {
        if (!this.options.runtimeOptions.watch) return fn(err);
        error(err, 4, false);
      }
      fn();
    }
  };
}