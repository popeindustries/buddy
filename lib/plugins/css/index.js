'use strict';

const { commentStrip, uniqueMatch } = require('../../utils/string');
const { debug, error, strong } = require('../../utils/cnsl');
const cssnano = require('cssnano');
const inline = require('./inline');
const transpile = require('./transpile');

const FILE_EXTENSIONS = ['css'];
// TODO: add support for 'url(*)' syntax
const RE_IMPORT = /@import\s['"]([^'"]+)['"];?/g;
const WORKFLOW_INLINEABLE = [
  'load',
  'compress:compress'
];
const WORKFLOW_WRITEABLE = [
  'inline',
  'transpile'
];

module.exports = {
  name: 'css',
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
  return class CSSFile extends File {
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
      super(id, filepath, 'css', options);

      this.workflows.inlineable = [WORKFLOW_INLINEABLE];
      this.workflows.writeable = [WORKFLOW_WRITEABLE];
    }

    /**
     * Parse file contents for dependency references
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
     * @returns {null}
     */
    parse (buildOptions, fn) {
      if (this.isInline || !buildOptions.bundle) return fn();

      super.addDependencies(uniqueMatch(commentStrip(this.content), RE_IMPORT)
        .map((match) => {
          match.id = match.match;
          return match;
        }),
        buildOptions
      );
      fn();
    }

    /**
     * Inline '@import' content
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
    inline (buildOptions, fn) {
      inline(this);
      debug(`inline: ${strong(this.relpath)}`, 4);
      fn();
    }

    /**
     * Transpile content
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
    transpile (buildOptions, fn) {
      const postcssOptions = Object.assign(
        { from: this.filepath },
        this.hasMaps
          ? { map: { annotation: false, inline: false, prev: this.map, sourcesContent: true } }
          : {},
        this.options.pluginOptions.postcss
      );
      const plugins = postcssOptions.plugins.slice().map((plugin) => {
        return Array.isArray(plugin)
          ? plugin[0](plugin[1])
          : plugin;
      });

      delete postcssOptions.plugins;

      if (buildOptions.compress) plugins.push(cssnano);

      transpile(this.content, this.filepath, plugins, postcssOptions, (err, results) => {
        if (err) {
          if (!this.options.runtimeOptions.watch) return fn(err);
          error(err, 4, false);
        }

        const { code: content, map } = results;

        this.setContent(content);
        if (map) this.setMap(map);
        debug(`transpile: ${strong(this.relpath)}`, 4);
        fn();
      });
    }
  };
}