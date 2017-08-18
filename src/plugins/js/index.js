// @flow

'use strict';

import typeof File from '../../File';
import type { DependencyReference } from '../../File';
import type Config, { BuildOptions, FileOptions } from '../../config';
import type { Utils } from '../../utils';

const { debug, error, strong, warn } = require('../../utils/cnsl');
const { resolve } = require('../../resolver');
const babelPluginTransformFlatten = require('./babel-plugin-transform-flatten');
const concat = require('./concat');
const flattenUMD = require('./flattenUMD');
const inline = require('./inline');
const md5 = require('md5');
const parse = require('./parse');
const path = require('path');
const rewriteDirnameFilename = require('./rewriteDirnameFilename');
const replaceDynamicReferences = require('./replaceDynamicReferences');
const replaceEnvironment = require('./replaceEnvironment');
const replaceReferences = require('./replaceReferences');
const sort = require('./sort');
const sourceMap = require('../../utils/sourceMap');
const transpile = require('./transpile');

const FILE_EXTENSIONS = ['js'];
const HEADER = '/** BUDDY BUILT **/';
const RE_BUDDY_BUILT = /^\/\*\* BUDDY BUILT \*\*\//;
const RE_ES6 = /\bconst |\blet |\b=>\b/g;
const RE_STRICT = /'use strict';?\s?/g;
// Browserify, closure compiler, webpack, etc
const RE_UMD_BUILT = /typeof define\s?===\s?["']function["']\s?&&\s?define\.amd|webpackUniversalModuleDefinition|code\s?=\s?["']MODULE_NOT_FOUND["']/;
const WORKFLOW_STANDARD = ['load', 'parse', 'compile', 'bundle:replaceEnvironment', 'transpile', 'runForDependencies'];
const WORKFLOW_INLINEABLE = ['load', 'replaceEnvironment', 'compress:compress'];
const WORKFLOW_WRITEABLE = [
  'inline',
  'bundle:reparse',
  // '!browser:rewriteDirnameFilename',
  // Capture output env vars
  'bundle:replaceEnvironment',
  'bundle:replaceReferences',
  'bundle:replaceDynamicReferences',
  'bundle:concat',
  'compress:compress'
];

module.exports = {
  name: 'js',
  type: 'js',

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
function define(File: File, utils: Utils): JSFile {
  const { file: fileUtils } = utils;

  return class JSFile extends File {
    depth: number;
    dynamicDependencyReferences: Array<DependencyReference>;
    isBuddyBuilt: boolean;
    isBuilt: boolean;
    isCircularDependency: boolean;
    isNpmModule: boolean;
    transpiledContent: string;
    transpiledFingerprint: string;
    transpiledMap: Object;

    constructor(id: string, filepath: string, type: string, options: FileOptions) {
      super(id, filepath, 'js', options);

      this.workflows.standard = WORKFLOW_STANDARD;
      this.workflows.inlineable = WORKFLOW_INLINEABLE;
      this.workflows.writeable = WORKFLOW_WRITEABLE;

      this.depth = 0;
      this.dynamicDependencyReferences = [];
      this.isCircularDependency = false;
      this.isNpmModule = this.options.npmModulepaths
        ? this.options.npmModulepaths.some(modulepath => this.filepath.includes(modulepath))
        : false;
      this.transpiledContent = '';
      this.transpiledFingerprint = '';
      this.transpiledMap;
    }

    /**
     * Retrieve flattened dependency tree
     */
    getAllDependencies(): Array<JSFile> {
      if (this.allDependencies == null) {
        this.allDependencies = sort(this);
      }

      const filteredDependencies = this.getAllDependencyReferences()
        .filter(reference => {
          return (
            !reference.isIgnored &&
            reference.file != null &&
            !reference.file.isLocked &&
            reference.file.type !== 'json' &&
            this.allDependencies.includes(reference.file)
          );
        })
        .map(reference => reference.file);

      return this.allDependencies.filter(dependency => filteredDependencies.includes(dependency));
    }

    /**
     * Add dynamic 'dependencies'
     */
    addDynamicDependencies(dependencies: Array<JSFile>) {
      const { fileFactory } = this.options;
      const resolveOptions = {
        browser: this.options.browser,
        cache: this.options.resolverCache,
        fileExtensions: this.options.fileExtensions
      };

      dependencies.forEach(dependency => {
        const filepath = resolve(this.filepath, dependency.id, resolveOptions);

        // Unable to resolve filepath or create instance
        if (filepath === '') {
          warn(`dynamic import ${strong(dependency.id)} for ${strong(this.relpath)} not found`, this.options.level);
          return;
        }

        const file = (dependency.file = fileFactory(filepath, this.options));

        this.dynamicDependencyReferences.push(dependency);
        if (this.options.buildFactory) {
          this.options.buildFactory(filepath, `${file.idSafe}-%hash%.${file.extension}`);
        }
      });
    }

    /**
     * Read file content
     */
    readFileContent(): string {
      let content = super.readFileContent();

      this.isBuddyBuilt = RE_BUDDY_BUILT.test(content);
      this.isBuilt = RE_UMD_BUILT.test(content);

      if (this.isBuilt) {
        content = flattenUMD(content, `$m['${this.id}']`);
      }
      if (this.isBuddyBuilt) {
        content = concat.unwrap(content, this.id);
      }

      return content;
    }

    /**
     * Hash 'content'
     */
    hashContent(forWrite: boolean = false): string {
      return forWrite
        ? md5(
            // TODO: add header
            [this, ...this.getAllDependencies()]
              .reduce((contents, file) => {
                contents.push(file.content);
                // Include hashes of dynamic builds which are not yet inlined
                if (file.dynamicDependencyReferences.length > 0) {
                  contents.push(...file.dynamicDependencyReferences.map(ref => ref.file.writeHash));
                }
                return contents;
              }, [])
              .join('')
          )
        : md5(this.content || this.fileContent);
    }

    /**
     * Read and store file contents
     */
    load(buildOptions: BuildOptions, fn: (?Error) => void) {
      super.load(buildOptions, err => {
        if (err) {
          return fn && fn();
        }

        RE_STRICT.lastIndex = 0;
        if (buildOptions != null && buildOptions.bundle && RE_STRICT.test(this.content)) {
          this.setContent(this.content.replace(RE_STRICT, ''));
        }

        fn && fn();
      });
    }

    /**
     * Parse file contents for dependency references
     */
    parse(buildOptions: BuildOptions, fn: (?Error) => void) {
      if (
        this.isBuddyBuilt ||
        this.isBuilt ||
        // Don't parse input file dependencies if not bundling
        (!buildOptions.bundle && this.isDependency)
      ) {
        return void fn();
      }

      const [requires, imports, dynamicImports] = parse(this.content);

      this.addDynamicDependencies(dynamicImports);
      super.addDependencies(requires.concat(imports), buildOptions);

      debug(`parse: ${strong(this.relpath)}`, 4);
      fn();
    }

    /**
     * Compile file contents [no-op]
     */
    compile(buildOptions: BuildOptions, fn: (?Error) => void) {
      debug(`compile: ${strong(this.relpath)}`, 4);
      fn();
    }

    /**
     * Replace process.env references with values
     */
    replaceEnvironment(buildOptions: BuildOptions, fn: (?Error) => void) {
      if (this.isBuddyBuilt || this.isBuilt) {
        return void fn();
      }
      // Force on server when compressed/deploy
      this.setContent(replaceEnvironment(this.content, buildOptions.compress ? true : buildOptions.browser));
      debug(`replace environment vars: ${strong(this.relpath)}`, 4);
      fn();
    }

    /**
     * Transpile file contents
     */
    transpile(buildOptions: BuildOptions, fn: (?Error) => void) {
      if (this.isBuddyBuilt || this.isBuilt) {
        this.transpiledContent = this.content;
        if (this.hasMaps) {
          this.transpiledMap = sourceMap.clone(this.map);
        }
        return void fn();
      }

      const babelOptions = this.options.pluginOptions.babel;
      const babelOptionsFingerprint = this.options.pluginOptions.babelFingerprint;
      const fingerprintableBuildOptions = Object.assign({}, buildOptions);

      delete fingerprintableBuildOptions.ignoredFiles;

      const buildOptionsFingerprint = md5(JSON.stringify(fingerprintableBuildOptions));
      const moduleString = `$m['${this.id}']`;
      let plugins = babelOptions.plugins.slice();
      let optionsFingerprint = babelOptionsFingerprint;

      // Skip running Babel plugins on node_modules files (if not es6)
      if (this.isNpmModule && !RE_ES6.test(this.content)) {
        plugins = [];
        optionsFingerprint = '';
      }
      // Flatten if bundling
      if (buildOptions.bundle) {
        const data = {
          // Do not replace 'module.exports' for writeable Node files
          replace: buildOptions.browser ? true : !this.isWriteable(buildOptions.batch),
          source: {
            moduleExports: moduleString,
            namespace: `${this.idSafe}__`
          }
        };

        plugins.push([babelPluginTransformFlatten, data]);
        optionsFingerprint += md5(`${data.replace.toString()}`);
      }

      const contentFingerprint = md5(JSON.stringify(this.content));
      const options = Object.assign({}, babelOptions, {
        babelrc: false,
        filename: this.relUrl,
        plugins,
        sourceMaps: this.hasMaps,
        sourceFileName: this.hasMaps ? this.relUrl : null
      });
      const transpiledFingerprint = `${contentFingerprint}:${optionsFingerprint}:${buildOptionsFingerprint}`;

      // Skip transpile if same fingerprint as previous
      if (transpiledFingerprint === this.transpiledFingerprint && this.transpiledContent !== '') {
        this.content = this.transpiledContent;
        this.map = this.transpiledMap;
      } else {
        try {
          if (this.hasMaps) {
            options.inputSourceMap = this.map.toJSON();
          }
          const { code: content, map } = transpile(this.content, options);

          this.transpiledContent = content;
          this.setContent(content);
          if (map) {
            this.setMap(map);
            this.transpiledMap = sourceMap.clone(this.map);
          }
          debug(`transpile: ${strong(this.relpath)}`, 4);
        } catch (err) {
          if (this.options.runtimeOptions.watch) {
            error(err, 4, false);
          } else {
            fn(err);
          }
        }
      }

      this.transpiledFingerprint = transpiledFingerprint;

      fn();
    }

    /**
     * Inline json/disabled dependency content
     */
    inline(buildOptions: BuildOptions, fn: (?Error) => void) {
      [...this.getAllDependencies(), this].forEach(file => {
        if (file.isBuddyBuilt || file.isBuilt) {
          return;
        }
        file.setContent(inline(file.content, file.dependencyReferences));
        debug(`inline: ${strong(file.relpath)}`, 4);
      });
      fn();
    }

    /**
     * Reparse transpiled file contents to account for possibly removed dependencies
     */
    reparse(buildOptions: BuildOptions, fn: (?Error) => void) {
      if (this.isDummy) {
        return void fn();
      }

      [this, ...this.getAllDependencies()].forEach(file => {
        if (file.isBuddyBuilt || file.isBuilt) {
          return;
        }

        const [requires, imports, dynamicImports] = parse(file.content);
        const referencesById = file.dependencyReferences.reduce((referencesById, dependency) => {
          referencesById[dependency.id] = dependency;
          return referencesById;
        }, {});
        const dynamicReferencesById = file.dynamicDependencyReferences.reduce((dynamicReferencesById, dependency) => {
          dynamicReferencesById[dependency.id] = dependency;
          return dynamicReferencesById;
        }, {});

        file.allDependencies = null;
        file.allDependencyReferences = null;
        file.dependencies = [];
        file.dependencyReferences = [];
        file.dynamicDependencyReferences = [];

        requires.concat(imports).forEach(dependency => {
          const originalReference = referencesById[dependency.id];

          // Can only have fewer not more references, so compare to original collection and reuse props
          if (originalReference) {
            dependency.isDisabled = originalReference.isDisabled;
            dependency.isIgnored = originalReference.isIgnored;
            file.dependencyReferences.push(dependency);
            if (originalReference.file != null) {
              dependency.file = originalReference.file;
              dependency.file.depth = 0;
              dependency.file.isCircularDependency = false;
              file.dependencies.push(dependency.file);
            }
          }
        });
        dynamicImports.forEach(dependency => {
          const originalReference = dynamicReferencesById[dependency.id];

          if (originalReference != null) {
            dependency.file = originalReference.file;
            file.dynamicDependencyReferences.push(dependency);
          }
        });

        debug(`reparse: ${strong(file.relpath)}`, 4);
      });
      fn();
    }

    /**
     * Replace relative dependency references with fully resolved
     */
    rewriteDirnameFilename(buildOptions: BuildOptions, fn: (?Error) => void) {
      [...this.getAllDependencies(), this].forEach(file => {
        if (file.isBuddyBuilt) {
          return;
        }
        file.setContent(rewriteDirnameFilename(file.content, path.dirname(this.writepath), file.filepath));
        debug(`replace __dirname/__filename references: ${strong(file.relpath)}`, 4);
      });
      fn();
    }

    /**
     * Replace relative dependency references with fully resolved
     */
    replaceReferences(buildOptions: BuildOptions, fn: (?Error) => void) {
      [...this.getAllDependencies(), this].forEach(file => {
        if (file.isBuddyBuilt || file.isBuilt) {
          return;
        }
        file.setContent(replaceReferences(file.content, file.dependencyReferences));
        debug(`replace dependency references: ${strong(file.relpath)}`, 4);
      });
      fn();
    }

    /**
     * Replace dynamic dependency references with fully resolved
     */
    replaceDynamicReferences(buildOptions: BuildOptions, fn: (?Error) => void) {
      [this, ...this.getAllDependencies()].forEach(file => {
        if (file.isBuilt) {
          return;
        }
        file.setContent(replaceDynamicReferences(file.content, buildOptions.browser, file.dynamicDependencyReferences));
        debug(`replace dynamic dependency references: ${strong(file.relpath)}`, 4);
      });
      fn();
    }

    /**
     * Concatenate file contents
     */
    concat(buildOptions: BuildOptions, fn: (?Error) => void) {
      concat(this, HEADER, buildOptions);
      debug(`concat: ${strong(this.relpath)}`, 4);
      fn();
    }

    /**
     * Rollback to transpiled state
     */
    rollback() {
      this.content = this.transpiledContent;
      this.map = this.transpiledMap;
    }

    /**
     * Reset content
     */
    reset(hard?: boolean) {
      super.reset(hard);
      this.depth = 0;
      this.dynamicDependencyReferences = [];
      this.isCircularDependency = false;
      if (hard) {
        this.transpiledContent = '';
        this.transpiledFingerprint = '';
        this.transpiledMap = null;
      }
    }
  };
}
