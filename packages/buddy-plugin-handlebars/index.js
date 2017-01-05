'use strict';

const handlebars = require('handlebars');

const DEFAULT_OPTIONS = {
  simple: true
};
const FILE_EXTENSIONS = ['handlebars', 'hbs'];
const RE_INCLUDE = /{{>\s['"]([^'"]+)['"]\s}}/g;
const WORKFLOW_WRITEABLE = [
  'inline',
  'compile',
  'parseInline',
  'inlineInline'
];

module.exports = {
  name: 'handlebars',
  type: 'html',

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
 * @param {Class} HTMLFile
 * @param {Object} utils
 * @returns {Class}
 */
function define (HTMLFile, utils) {
  const { debug, error, strong } = utils.cnsl;
  const { uniqueMatch } = utils.string;

  return class HANDLEBARSFile extends HTMLFile {
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

      this.workflows.writeable = WORKFLOW_WRITEABLE;
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
     *  - {Array} ignoredFiles
     *  - {Boolean} helpers
     *  - {Boolean} watchOnly
     * @param {Function} fn(err)
     */
    parse (buildOptions, fn) {
      // Add sidecar json file
      const sidecarData = super.parseSidecarDependency();
      // Parse includes
      let matches = uniqueMatch(this.content, RE_INCLUDE)
        .map((match) => {
          match.id = match.match;
          return match;
        });

      if (sidecarData) matches.push(sidecarData);
      super.addDependencies(matches, buildOptions);
      fn();
    }

    /**
     * Inline include dependency content
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
    inline (buildOptions, fn) {
      super.inlineDependencyReferences();
      debug(`inline: ${strong(this.relpath)}`, 4);
      fn();
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
     * @returns {null}
     */
    compile (buildOptions, fn) {
      try {
        const options = Object.assign({}, DEFAULT_OPTIONS, this.options.pluginOptions.handlebars);
        const template = handlebars.compile(this.content, options);

        this.setContent(template(this.findSidecarDependency()));
        debug(`compile: ${strong(this.relpath)}`, 4);
        fn();
      } catch (err) {
        if (!this.options.runtimeOptions.watch) return fn(err);
        error(err, 4, false);
      }
    }

    /**
     * Parse file contents for inline dependency references
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
    parseInline (buildOptions, fn) {
      super.parse(buildOptions, fn);
    }

    /**
     * Inline css/img/js dependency content
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
    inlineInline (buildOptions, fn) {
      super.inline(buildOptions, fn);
    }
  };
}