'use strict';

const { debug, strong } = require('../../utils/cnsl');
const fs = require('fs');
const inlineContext = require('inline-source/lib/context');
const inlineParse = require('inline-source/lib/parse');
const inlineRun = require('inline-source/lib/run');
const path = require('path');

const FILE_EXTENSIONS = ['html', 'htm'];
const WORKFLOW_WRITE = [
  'inline'
];

module.exports = {
  name: 'html',
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
 * @param {Class} File
 * @param {Object} utils
 * @returns {Class}
 */
function define (File, utils) {
  return class HTMLFile extends File {
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
      super(id, filepath, 'html', options);

      this.workflows.write = WORKFLOW_WRITE;
    }

    /**
     * Parse file contents for dependency references
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
    parse (buildOptions, fn) {
      let context = inlineContext.create({ compress: false });

      context.html = this.content;
      context.htmlpath = this.filepath;
      inlineParse(context, (err) => {
        if (err) return fn(err);

        super.addDependencies(context.sources.slice(), buildOptions);
        fn();
      });
    }

    /**
     * Find sidecar data file
     * @returns {Object}
     */
    findSidecarDependency () {
      const filepath = path.resolve(path.dirname(this.filepath), this.name.replace(`.${this.extension}`, '.json'));

      if (fs.existsSync(filepath)) return { context: '', filepath, match: '' };
    }

    /**
     * Inline css/img/js dependency content
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
    inline (buildOptions, fn) {
      this.runWorkflowForDependencies('inline', 'pre', buildOptions, (err) => {
        if (err) return fn(err);

        // Find dependencies acquired via inline-source
        const sources = this.dependencyReferences.filter((reference) => {
          if ('stack' in reference) {
            // Copy to override inline-source behaviour
            reference.fileContent = reference.file.content;
            reference.compress = buildOptions.compress;
            return true;
          }
          return false;
        });

        if (!sources.length) return fn(null, this.content);

        // Update transformed html content
        let context = sources[0].parentContext;

        context.html = this.content;

        inlineRun(context, sources, false, (err, content) => {
          if (err) return fn(err);

          debug(`inline: ${strong(this.relpath)}`, 4);
          this.content = content;
          fn();
        });
      });
    }
  };
}