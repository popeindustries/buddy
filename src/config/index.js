// @flow

'use strict';

import type { Utils } from '../utils';
import type Build from '../Build';
import type FileCache from '../cache/FileCache';
import type ResolverCache from '../cache/ResolverCache';
import type { IFile } from '../File';
type BuildOptions = {
  batch: boolean,
  boilerplate: boolean,
  bootstrap: boolean,
  browser: boolean,
  bundle: boolean,
  compress: boolean,
  helpers: boolean,
  ignoredFiles: Array<string>,
  importBoilerplate: boolean,
  watchOnly: boolean
};
type FileOptions = {
  browser: boolean,
  buildFactory: (string, string) => Build,
  bundle: boolean,
  fileCache: FileCache,
  fileExtensions: { [string]: Array<string> },
  fileFactory: (string, FileOptions) => File,
  level: number,
  npmModulepaths: Array<string>,
  pluginOptions: { [string]: Object },
  resolverCache: ResolverCache,
  runtimeOptions: RuntimeOptions,
  sourceroot: string,
  webroot: string
};
type RuntimeOptions = {
  compress: boolean,
  debug: boolean,
  deploy: boolean,
  grep: boolean,
  invert: boolean,
  maps: boolean,
  reload: boolean,
  script: boolean,
  serve: boolean,
  watch: boolean
};
type ServerOptions = {
  buddyServerPath?: string,
  directory: string,
  env?: Array<string>,
  extraDirectories: Array<string> | null,
  file: string | null,
  flags?: Array<string>,
  headers?: Object,
  port: number,
  sourceroot: string | null,
  webroot: string | null
};
export type { BuildOptions, FileCache, FileOptions, ResolverCache, RuntimeOptions, ServerOptions };

const { error, print, strong } = require('../utils/cnsl');
const { exists } = require('../utils/filepath');
const { hunt: { sync: hunt } } = require('recur-fs');
const { isInvalid, isNullOrUndefined } = require('../utils/is');
const buddyPlugins = require('./buddyPlugins');
const buildParser = require('./buildParser');
const buildPlugins = require('./buildPlugins');
const cache = require('../cache');
const chalk = require('chalk');
const fs = require('fs');
const path = require('path');
const serverParser = require('./serverParser');
const utils = require('../utils');

const DEFAULT_MANIFEST = {
  js: 'buddy.js',
  json: 'buddy.json',
  pkgjson: 'package.json'
};
const DEFAULT_RUNTIME_OPTIONS = {
  compress: false,
  debug: false,
  deploy: false,
  grep: false,
  invert: false,
  maps: false,
  reload: false,
  script: false,
  serve: false,
  watch: false
};

module.exports = class Config {
  builds: ?Array<Build>;
  fileDefinitionByExtension: { [string]: Class<IFile> };
  fileExtensions: { [string]: Array<string> };
  npmModulepaths: Array<string>;
  runtimeOptions: RuntimeOptions;
  script: string;
  server: ServerOptions;
  url: string;

  constructor(configPath?: string | Object, options?: Object) {
    const runtimeOptions: RuntimeOptions = Object.assign({}, DEFAULT_RUNTIME_OPTIONS, options);

    // Force NODE_ENV
    if (runtimeOptions.deploy) {
      process.env.NODE_ENV = 'production';
    } else if (process.env.NODE_ENV == null) {
      process.env.NODE_ENV = 'development';
    }

    const cmd = (runtimeOptions.deploy && 'deploy') || (runtimeOptions.watch && 'watch') || 'build';
    const env = process.env.NODE_ENV;
    let data;

    // No config specified
    if (isNullOrUndefined(configPath)) {
      this.url = locateConfig();
      data = normalizeData(require(this.url), env);
    } else {
      // Path or namespace
      if (typeof configPath === 'string') {
        // Determine if passed a namespace ('development', etc)
        const isNamespaced = path.extname(configPath) === '' && !exists(path.resolve(configPath));

        this.url = locateConfig(isNamespaced ? '' : configPath);
        data = normalizeData(require(this.url), isNamespaced ? configPath : env);
        // Passed in JSON object
      } else {
        this.url = '';
        data = normalizeData(configPath, env);
      }

      print(`\n${chalk.green.inverse(' BUDDY ' + cmd + ' ')} ${chalk.grey(new Date().toLocaleTimeString())}`, 0);
      // Set current directory to location of file
      if (!isInvalid(this.url)) {
        process.chdir(path.dirname(this.url));
        print('\nloaded config ' + strong(this.url), 0);
      }
    }

    this.fileDefinitionByExtension = {};
    this.fileExtensions = {};
    this.npmModulepaths = parseNpmModulePaths();
    this.runtimeOptions = runtimeOptions;

    // Generates fileExtensions/types used to validate build
    buddyPlugins.load(this);

    this.script = isNullOrUndefined(data.script) ? '' : data.script;
    // Parse 'server' data parameter
    this.server = serverParser(data.server, truntimeOptions);
    // Parse 'builds' data parameter
    this.builds = buildParser(this);
  }

  /**
   * Register file 'extensions' for 'type'
   */
  registerFileExtensionsForType(extensions: Array<string>, type: string) {
    extensions = [...extensions];
    if (!this.fileExtensions[type]) {
      this.fileExtensions[type] = [];
    }
    extensions.forEach(extension => {
      if (!this.fileExtensions[type].includes(extension)) {
        this.fileExtensions[type].push(extension);
      }
    });
  }

  /**
   * Register target 'version' for 'type'
   */
  registerTargetVersionForType(version: string, type: string, plugins: Array<string | Array<[string, Object]>>) {
    if (type === 'js') {
      buildPlugins.addPreset('babel', version, plugins);
    }
  }

  /**
   * Register file definition and 'extensions' for 'type'
   */
  registerFileDefinitionAndExtensionsForType(define: (IFile, Utils) => IFile, extensions: Array<string>, type: string) {
    const def = define(this.fileDefinitionByExtension[type] || File, utils);

    if (extensions != null) {
      extensions.forEach(extension => {
        this.fileDefinitionByExtension[extension] = def;
      });
      this.registerFileExtensionsForType(extensions, type);
    }
  }

  /**
   * Extend file definition for 'extensions' or 'type'
   */
  extendFileDefinitionForExtensionsOrType(extend: (Object, Object) => void, extensions: Array<string>, type: string) {
    const key = extensions != null ? extensions[0] : this.fileExtensions[type][0];
    const def = this.fileDefinitionByExtension[key];

    if (def == null) {
      return void error(`no File type available for extension for ${strong(key)}`);
    }

    extend(def.prototype, utils);
  }

  /**
   * Destroy instance
   */
  destroy() {
    cache.clear();
  }
};

/**
 * Locate the configuration file
 * Walks the directory tree if no file/directory specified
 */
function locateConfig(url?: string): string {
  let configPath = '';

  function check(dir) {
    // Support js, json, and package.json
    const urljs = path.join(dir, DEFAULT_MANIFEST.js);
    const urljson = path.join(dir, DEFAULT_MANIFEST.json);
    const urlpkgjson = path.join(dir, DEFAULT_MANIFEST.pkgjson);
    let urlFinal;

    if (exists((urlFinal = urljs)) || exists((urlFinal = urljson)) || exists((urlFinal = urlpkgjson))) {
      return urlFinal;
    }
    return '';
  }

  if (url != null) {
    configPath = path.resolve(url);

    try {
      // Try default file name if passed directory
      if (!path.extname(configPath).length || fs.statSync(configPath).isDirectory()) {
        configPath = check(configPath);
        if (configPath === '') {
          throw Error('no default found');
        }
      } else if (!exists(configPath)) {
        throw Error(`${strong(configPath)} file not found`);
      }
    } catch (err) {
      throw Error(`${strong('buddy')} config not found in ${strong(path.dirname(url))}`);
    }

    // No url specified
  } else {
    try {
      // Find the first instance of a DEFAULT file based on the current working directory
      configPath = hunt(
        process.cwd(),
        (resource, stat) => {
          if (stat.isFile()) {
            const basename = path.basename(resource);

            return (
              basename === DEFAULT_MANIFEST.js ||
              basename === DEFAULT_MANIFEST.json ||
              basename === DEFAULT_MANIFEST.pkgjson
            );
          }
        },
        true
      );
    } catch (err) {
      if (isInvalid(configPath)) {
        throw Error(`${strong('buddy')} config not found`);
      }
    }
  }

  return configPath;
}

/**
 * Parse all npm package paths
 */
function parseNpmModulePaths(): Array<string> {
  const jsonPath = path.resolve('package.json');

  try {
    const json = require(jsonPath);

    return ['dependencies', 'devDependencies', 'optionalDependencies'].reduce((packages, type) => {
      if (type in json) {
        for (const dependency in json[type]) {
          packages.push(path.resolve('node_modules', dependency));
        }
      }
      return packages;
    }, []);
  } catch (err) {
    return [];
  }
}

/**
 * Normalize 'data'
 */
function normalizeData(data: Object, namespace?: string): Object {
  // Package.json
  if (!isNullOrUndefined(data.buddy)) {
    data = data.buddy;
  }
  // Handle super simple mode
  if (!isNullOrUndefined(data.input)) {
    data = { build: [data] };
  }
  if (!isNullOrUndefined(namespace) && !isNullOrUndefined(data[namespace])) {
    const namespacedData = data[namespace];

    if ('server' in data) {
      namespacedData.server = data.server;
    }
    if ('script' in data) {
      namespacedData.script = data.script;
    }
    data = namespacedData;
  }

  return data;
}
