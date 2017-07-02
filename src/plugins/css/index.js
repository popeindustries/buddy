// @flow

'use strict';

import typeof File from '../../File';

const { commentStrip, uniqueMatch } = require('../../utils/string');
const { debug, error, strong } = require('../../utils/cnsl');
const inline = require('./inline');
const transpile = require('./transpile');

const FILE_EXTENSIONS = ['css'];
// TODO: add support for 'url(*)' syntax
const RE_IMPORT = /@import\s['"]([^'"]+)['"];?/g;
const WORKFLOW_INLINEABLE = ['load', 'compress:compress'];
const WORKFLOW_WRITEABLE = ['inline', 'transpile'];

module.exports = {
  name: 'css',
  type: 'css',

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
function define(File: File, utils: Object): CSSFile {
  return class CSSFile extends File {
    constructor(id: string, filepath: string, options: FileOptions) {
      super(id, filepath, 'css', options);

      this.workflows.inlineable = WORKFLOW_INLINEABLE;
      this.workflows.writeable = WORKFLOW_WRITEABLE;
    }

    /**
     * Parse file contents for dependency references
     */
    parse(buildOptions: BuildOptions, fn: (?Error) => void) {
      if (this.isInline || !buildOptions.bundle) {
        return void fn();
      }

      super.addDependencies(
        uniqueMatch(commentStrip(this.content), RE_IMPORT).map(match => {
          match.id = match.match;
          return match;
        }),
        buildOptions
      );
      fn();
    }

    /**
     * Inline '@import' content
     */
    inline(buildOptions: BuildOptions, fn: (?Error) => void) {
      inline(this);
      debug(`inline: ${strong(this.relpath)}`, 4);
      fn();
    }

    /**
     * Transpile content
     */
    transpile(buildOptions: BuildOptions, fn: (?Error) => void) {
      const postcssOptions = Object.assign(
        { from: this.filepath },
        this.hasMaps ? { map: { annotation: false, inline: false, prev: this.map, sourcesContent: true } } : {},
        this.options.pluginOptions.postcss
      );
      const plugins = postcssOptions.plugins.slice().map(plugin => {
        return Array.isArray(plugin) ? plugin[0](plugin[1]) : plugin;
      });

      delete postcssOptions.plugins;

      transpile(this.content, this.filepath, plugins, postcssOptions, (err, results) => {
        if (err) {
          if (!this.options.runtimeOptions.watch) {
            return fn(err);
          }
          error(err, 4, false);
        }

        const { code: content, map } = results;

        this.setContent(content);
        if (map) {
          this.setMap(map);
        }
        debug(`transpile: ${strong(this.relpath)}`, 4);
        fn();
      });
    }
  };
}
