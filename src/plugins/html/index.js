// @flow

'use strict';

import typeof File from '../../File';

const { debug, strong, warn } = require('../../utils/cnsl');
const { exists } = require('../../utils/filepath');
const inlineContext = require('inline-source/lib/context');
const inlineParse = require('inline-source/lib/parse');
const inlineRun = require('inline-source/lib/run');
const path = require('path');
const replaceEnvironment = require('./replaceEnvironment');

const FILE_EXTENSIONS = ['html', 'htm'];
const WORKFLOW_STANDARD = ['load', 'replaceEnvironment', 'parse', 'runForDependencies'];
const WORKFLOW_WRITEABLE = ['inline'];

module.exports = {
  name: 'html',
  type: 'html',

  /**
   * Register plugin
   */
  register(config: Config) {
    config.registerFileDefinitionAndExtensionsForType(define, FILE_EXTENSIONS, this.type);
  }
};

/**
 * Extend 'File' with new behaviour
 */
function define(File: File, utils: Object): HTMLFile {
  return class HTMLFile extends File {
    constructor(id: string, filepath: string, options: FileOptions) {
      super(id, filepath, 'html', options);

      this.hasMaps = false;
      this.workflows.standard = WORKFLOW_STANDARD;
      this.workflows.writeable = WORKFLOW_WRITEABLE;
    }

    /**
     * Parse file contents for dependency references
     */
    parse(buildOptions: BuildOptions, fn: (?Error) => void) {
      const context = inlineContext.create({ compress: false });

      context.html = this.content;
      context.htmlpath = this.filepath;
      inlineParse(context, err => {
        if (err) {
          return fn(err);
        }

        const dependencies = context.sources.map(source => {
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
     */
    parseSidecarDependency(): ?{ context: string, filepath: string, match: string } {
      const filepath = path.resolve(path.dirname(this.filepath), this.name.replace(`.${this.extension}`, '.json'));

      if (exists(filepath)) {
        return { context: '', filepath, match: '' };
      }
    }

    /**
     * Retrieve sidecar data dependency
     */
    findSidecarDependency(): Object {
      let data = {};

      // Find sidecar data
      for (const dependency of this.dependencies) {
        if (dependency.type === 'json') {
          try {
            data = JSON.parse(dependency.content);
          } catch (err) {
            warn(`malformed json file: ${strong(dependency.filepath)}`, this.options.level);
          }
        }
      }

      return data;
    }

    /**
     * Replace {BUDDY_*} references with values
     */
    replaceEnvironment(buildOptions: BuildOptions, fn: (?Error) => void) {
      this.setContent(replaceEnvironment(this.content));
      debug(`replace environment vars: ${strong(this.relpath)}`, 4);
      fn();
    }

    /**
     * Inline css/img/js dependency content
     */
    inline(buildOptions: BuildOptions, fn: (?Error) => void) {
      const inlineableDependencyReferences = [...this.dependencyReferences].filter(
        reference => reference.file.isInline
      );

      if (!inlineableDependencyReferences.length) {
        return void fn();
      }

      // Prepare for inline-source
      inlineableDependencyReferences.forEach(reference => {
        // Copy to override inline-source behaviour
        reference.fileContent = reference.file.content;
        reference.compress = buildOptions.compress;
      });

      // Update transformed html content
      const context = inlineableDependencyReferences[0].parentContext;

      context.html = this.content;

      try {
        const content = inlineRun(context, inlineableDependencyReferences, false);

        this.setContent(content);
      } catch (err) {
        return void fn(err);
      }

      debug(`inline: ${strong(this.relpath)}`, 4);
      fn();
    }
  };
}
