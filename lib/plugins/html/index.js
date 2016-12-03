'use strict';

const { debug, strong, warn } = require('../../utils/cnsl');
const { regexpEscape } = require('../../utils/string');
const fs = require('fs');
const inlineContext = require('inline-source/lib/context');
const inlineParse = require('inline-source/lib/parse');
const inlineRun = require('inline-source/lib/run');
const path = require('path');
const replaceEnvironment = require('./replaceEnvironment');

const FILE_EXTENSIONS = ['html', 'htm'];
const WORKFLOW_STANDARD = [
  'load',
  'replaceEnvironment',
  'parse',
  'runWorkflowForDependencies'
];
const WORKFLOW_WRITEABLE = [
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
      super(id, filepath, 'html', options);

      this.hasMaps = false;
      this.map = null;
      this.workflows.standard = [WORKFLOW_STANDARD];
      this.workflows.writeable = [WORKFLOW_WRITEABLE];
    }

    /**
     * Inline dependencyReferences
     */
    inlineDependencyReferences () {
      function inline (content, references) {
        let inlineContent;

        references.forEach((reference) => {
          inlineContent = reference.file.dependencyReferences.length
            // Inline nested dependencies
            ? inline(reference.file.content, reference.file.dependencyReferences)
            : reference.file.content;
          if (reference.context) content = content.replace(new RegExp(regexpEscape(reference.context), 'g'), inlineContent);
        });
        return content;
      }

      this.content = inline(this.content, this.dependencyReferences);
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
     */
    parse (buildOptions, fn) {
      let context = inlineContext.create({ compress: false });

      context.html = this.content;
      context.htmlpath = this.filepath;
      inlineParse(context, (err) => {
        if (err) return fn(err);

        const dependencies = context.sources.map((source) => {
          const { attributes } = source;

          source.id = attributes.src || attributes.href || attributes.data;
          return source;
        });

        super.addDependencies(dependencies, buildOptions);
        fn();
      });
    }

    /**
     * Parse sidecar data file
     * @returns {Object}
     */
    parseSidecarDependency () {
      const filepath = path.resolve(path.dirname(this.filepath), this.name.replace(`.${this.extension}`, '.json'));

      if (fs.existsSync(filepath)) return { context: '', filepath, match: '' };
    }

    /**
     * Retrieve sidecar data dependency
     * @returns {Object}
     */
    findSidecarDependency () {
      let data = {};

      // Find sidecar data
      for (const dependency of this.dependencies) {
        if (dependency.type == 'json') {
          try {
            data = JSON.parse(dependency.content);
          } catch (err) {
            warn(`malformed json file: ${strong(dependency.filepath)}`);
          }
        }
      }

      return data;
    }

    /**
     * Replace {BUDDY_*} references with values
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
    replaceEnvironment (buildOptions, fn) {
      this.setContent(replaceEnvironment(this.content));
      debug(`replace environment vars: ${strong(this.relpath)}`, 4);
      fn();
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
     *  - {Boolean} helpers
     *  - {Array} ignoredFiles
     *  - {Boolean} import
     *  - {Boolean} watchOnly
     * @param {Function} fn(err)
     */
    inline (buildOptions, fn) {
      const inlineDependencyReferences = [...this.dependencyReferences].filter((reference) => reference.file.isInline);
      const inlineDependencies = inlineDependencyReferences.map((reference) => reference.file);

      this.runForDependencies('inlineable', buildOptions, inlineDependencies, (err) => {
        if (err) return fn(err);
        if (!inlineDependencyReferences.length) return fn();

        // Prepare for inline-source
        inlineDependencyReferences.forEach((reference) => {
          // Copy to override inline-source behaviour
          reference.fileContent = reference.file.content;
          reference.compress = buildOptions.compress;
        });

        // Update transformed html content
        let context = inlineDependencyReferences[0].parentContext;

        context.html = this.content;
        inlineRun(context, inlineDependencyReferences, false, (err, content) => {
          if (err) return fn(err);

          debug(`inline: ${strong(this.relpath)}`, 4);
          this.setContent(content);
          fn();
        });
      });
    }
  };
}