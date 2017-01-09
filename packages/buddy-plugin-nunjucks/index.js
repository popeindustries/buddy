'use strict';

const nunjucks = require('nunjucks');
const parallel = require('async/parallel');

const DEFAULT_OPTIONS = {
  noCache: true
};
const FILE_EXTENSIONS = ['nunjucks', 'nunjs', 'njk'];
const RE_INCLUDE = /{%\s(?:extends|include)\s['"]([^'"]+)['"]\s?%}/g;
const RE_IMPORT = /{%\simport\s['"]([^'"]+)['"]\s?%}/g;
const WORKFLOW_WRITEABLE = [
  'replaceReferences',
  'inlineInlineable',
  'inlineIncludes',
  'compile',
  'reparse',
  'inline'
];

module.exports = {
  name: 'nunjucks',
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
  const { callable } = utils;
  const { debug, error, strong } = utils.cnsl;
  const { regexpEscape, uniqueMatch } = utils.string;

  return class NUNJUCKSFile extends File {
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
      super.parse(buildOptions, (err) => {
        if (err) return fn(err);

        // Find sidecar json file
        const sidecarData = super.parseSidecarDependency();
        // Parse includes
        let matches = uniqueMatch(this.content, RE_INCLUDE)
          .map((match) => {
            match.id = match.match;
            match.isInclude = true;
            return match;
          });

        // Parse imports
        matches.push(...uniqueMatch(this.content, RE_IMPORT)
          .map((match) => {
            match.id = match.match;
            match.isImport = true;
            return match;
          }));
        if (sidecarData) matches.push(sidecarData);

        super.addDependencies(matches, buildOptions);
        fn();
      });
    }

    /**
     * Replace relative dependency references with fully resolved
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
    replaceReferences (buildOptions, fn) {
      [...this.getAllDependencies(), this].forEach((file) => {
        if (file instanceof NUNJUCKSFile && this.dependencyReferences.length) {
          let content = file.content;

          file.dependencyReferences.forEach((reference) => {
            if (reference.file && reference.isImport) {
              const context = reference.context.replace(reference.id, reference.file.filepath);

              // Create new RegExp so that flags work properly
              content = content.replace(new RegExp(regexpEscape(reference.context), 'g'), context);
            }
          });

          file.setContent(content);
        }
      });
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
    inlineInlineable (buildOptions, fn) {
      // Only dependencies
      parallel([...this.getAllDependencies()].reduce((inlineable, file) => {
        if (file instanceof NUNJUCKSFile && this.dependencyReferences.length) {
          inlineable.push(callable(file, 'inline', buildOptions));
        }
        return inlineable;
      }, []), fn);
    }

    /**
     * Inline partials content
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
    inlineIncludes (buildOptions, fn) {
      [...this.getAllDependencies(), this].forEach((file) => {
        if (file instanceof NUNJUCKSFile && file.dependencyReferences.length) {
          let content = file.content;

          file.dependencyReferences.forEach((reference) => {
            if (reference.file && reference.context && reference.isInclude) {
              content = content.replace(new RegExp(regexpEscape(reference.context), 'g'), reference.file.content);
            }
          });

          file.setContent(content);
        }
      });
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
     */
    compile (buildOptions, fn) {
      const options = Object.assign({}, DEFAULT_OPTIONS, this.options.pluginOptions.nunjucks);

      nunjucks.configure(null, options);
      nunjucks.renderString(this.content, this.findSidecarDependency(), (err, content) => {
        if (err) {
          if (!this.options.runtimeOptions.watch) return fn(err);
          error(err, 4, false);
        }
        this.setContent(content);
        debug(`compile: ${strong(this.relpath)}`, 4);
        fn();
      });
    }

    /**
     * Reparse file contents for dependency references
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
    reparse (buildOptions, fn) {
      this.allDependencies = null;
      this.allDependencyReferences = null;
      this.dependencies = [];
      this.dependencyReferences = [];

      super.parse(buildOptions, fn);
    }
  };
}