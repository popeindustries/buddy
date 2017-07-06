// @flow

'use strict';

type FileWorkflows = {
  standard: Array<string>,
  standardWatch: Array<string>,
  inlineable: Array<string>,
  writeable: Array<string>
};
type DependencyReference = {
  context?: string,
  file?: File,
  filepath?: string,
  id?: string,
  isDisabled?: boolean,
  isIgnored?: boolean,
  isUnresolved?: boolean,
  match?: string
};
type WriteResult = {
  content: string,
  filepath: string,
  type: string,
  printPrefix?: string
};
import type { BuildOptions, FileOptions } from './config';
interface IFile {
  allDependencies: Array<IFile> | null,
  allDependencyReferences: Array<DependencyReference> | null,
  content: string,
  fileContent: string,
  date: number,
  dependencies: Array<IFile>,
  dependencyReferences: Array<DependencyReference>,
  encoding: string,
  extension: string,
  filepath: string,
  hash: string,
  hasMaps: boolean,
  hasUnresolvedDependencies: boolean,
  id: string,
  idSafe: string,
  isDependency: boolean,
  isDummy: boolean,
  isInline: boolean,
  isLocked: boolean,
  map: Object,
  mapUrl: string,
  name: string,
  options: FileOptions,
  relpath: string,
  relUrl: string,
  totalLines: number,
  type: string,
  writepath: string,
  writeDate: number,
  writeHash: string,
  writeUrl: string,
  workflows: FileWorkflows,
  isWriteable(batch: boolean): boolean,
  isInlineable(): boolean,
  setContent(content: string): void,
  setMap(map?: SourceMapGenerator | Object): void,
  getAllDependencies(): Array<IFile>,
  getAllDependencyReferences(): Array<DependencyReference>,
  addDependencies(dependencies: Array<DependencyReference>, buildOptions: BuildOptions): void,
  parseWorkflow(type: string, buildOptions: BuildOptions): Array<string>,
  run(type: string, buildOptions: BuildOptions, fn: (?Error) => void): void,
  runForDependencies(type: string, dependencies?: Array<IFile>, buildOptions: BuildOptions, fn: (?Error) => void): void,
  readFileContent(): string,
  hashContent(forWrite: boolean): string,
  load(buildOptions?: BuildOptions, fn?: (?Error) => void): void,
  parse(buildOptions: BuildOptions, fn: (?Error) => void): void,
  compile(buildOptions: BuildOptions, fn: (?Error) => void): void,
  compress(buildOptions: BuildOptions, fn: (?Error) => void): void,
  prepareForWrite(filepath: string, buildOptions: BuildOptions): void,
  write(buildOptions: BuildOptions, fn: (?Error, ?WriteResult) => void): void,
  reset(hard?: boolean): void,
  destroy(): void
}
export type { DependencyReference, IFile, WriteResult };

const { debug, strong, warn } = require('./utils/cnsl');
const { dummyFile } = require('./settings');
const { exists, generateUniqueFilepath, isUniqueFilepath } = require('./utils/filepath');
const { sourceMapCommentStrip, truncate } = require('./utils/string');
const { isEmptyArray, isInvalid } = require('./utils/is');
const { mkdir: { sync: mkdir } } = require('recur-fs');
const { readFileSync: readFile, writeFileSync: writeFile } = require('fs');
const { resolve } = require('./resolver');
const { SourceMapGenerator } = require('source-map');
const { walk } = require('./utils/tree');
const callable = require('./utils/callable');
const md5 = require('md5');
const nativeModules = require('./utils/nativeModules');
const parallel = require('async/parallel');
const path = require('path');
const series = require('async/series');
const sourceMap = require('./utils/sourceMap');

const RE_ESCAPE_ID = /[@#._-\s/\\]/g;
const RE_WIN_LINE_ENDINGS = /\r\n/g;
const RE_WIN_SEPARATOR = /\\/g;
const WORKFLOW_INLINEABLE = ['load'];
const WORKFLOW_STANDARD = ['load', 'parse', 'runForDependencies'];

module.exports = class File implements IFile {
  allDependencies: Array<IFile> | null;
  allDependencyReferences: Array<DependencyReference> | null;
  content: string;
  fileContent: string;
  date: number;
  dependencies: Array<IFile>;
  dependencyReferences: Array<DependencyReference>;
  encoding: string;
  extension: string;
  filepath: string;
  hash: string;
  hasMaps: boolean;
  hasUnresolvedDependencies: boolean;
  id: string;
  idSafe: string;
  isDependency: boolean;
  isDummy: boolean;
  isInline: boolean;
  isLocked: boolean;
  map: Object;
  mapUrl: string;
  name: string;
  options: FileOptions;
  relpath: string;
  relUrl: string;
  totalLines: number;
  type: string;
  writepath: string;
  writeDate: number;
  writeHash: string;
  writeUrl: string;
  workflows: FileWorkflows;

  constructor(id: string, filepath: string, type?: string, options: FileOptions) {
    if (type == null) {
      type = 'generic';
    }

    this.allDependencies;
    this.allDependencyReferences;
    this.content = '';
    this.fileContent = '';
    this.date = Date.now();
    this.dependencies = [];
    this.dependencyReferences = [];
    this.encoding = 'utf8';
    this.extension = path.extname(filepath).slice(1);
    this.filepath = filepath;
    this.hash = '';
    this.hasMaps = options.runtimeOptions.maps;
    this.hasUnresolvedDependencies = false;
    this.id = id;
    this.idSafe = id.replace(RE_ESCAPE_ID, '');
    this.isDependency = false;
    this.isDummy = filepath === dummyFile;
    this.isInline = false;
    this.isLocked = false;
    this.map;
    this.mapUrl = '';
    this.name = path.basename(filepath);
    this.options = options;
    this.relpath = truncate(path.relative(process.cwd(), filepath));
    this.relUrl = this.relpath.replace(RE_WIN_SEPARATOR, '/');
    this.totalLines = 0;
    this.type = type;
    this.writepath = '';
    this.writeDate = 0;
    this.writeHash = '';
    this.writeUrl = '';
    this.workflows = {
      standard: WORKFLOW_STANDARD,
      standardWatch: WORKFLOW_STANDARD,
      inlineable: WORKFLOW_INLINEABLE,
      writeable: []
    };

    // Force generation of hash
    this.load();

    debug(`created File instance ${strong(this.relpath)}`, 3);
  }

  /**
   * Retrieve writeable state
   */
  isWriteable(batch: boolean): boolean {
    return !this.isInline &&
    // Only writeable if not node_module in batch mode
    batch
      ? !this.filepath.includes('node_modules')
      : !this.isDependency;
  }

  /**
   * Retrieve inlineable state
   */
  isInlineable(): boolean {
    return this.isInline;
  }

  /**
   * Set 'content'
   */
  setContent(content: string) {
    if (typeof content === 'string') {
      this.content = content || '';
      this.totalLines = this.content ? this.content.split('\n').length : 0;
    } else {
      this.content = content;
    }
  }

  /**
   * Set 'map'
   */
  setMap(map?: SourceMapGenerator | Object) {
    if (!this.hasMaps || typeof this.fileContent !== 'string') {
      return;
    }

    this.map =
      map == null
        ? sourceMap.create(this.fileContent, this.relUrl)
        : map instanceof SourceMapGenerator ? map : sourceMap.createFromMap(map, this.fileContent, this.relUrl);
  }

  /**
   * Retrieve flattened dependency tree
   */
  getAllDependencies(): Array<File> {
    if (this.allDependencies == null) {
      const dependencies = [];

      walk(this.dependencies, file => {
        if (!dependencies.includes(file)) {
          dependencies.push(file);
          return file.dependencies;
        }
      });

      this.allDependencies = dependencies;
    }

    return this.allDependencies;
  }

  /**
   * Retrieve flattened dependency reference tree
   */
  getAllDependencyReferences(): Array<DependencyReference> {
    if (this.allDependencyReferences == null) {
      const references = [];
      const seen = {};

      walk(this.dependencyReferences, reference => {
        if (reference.file == null || seen[reference.file.id] == null) {
          references.push(reference);
          if (reference.file != null) {
            seen[reference.file.id] = true;
            return reference.file.dependencyReferences;
          }
        }
      });

      this.allDependencyReferences = references;
    }

    return this.allDependencyReferences;
  }

  /**
   * Add 'dependencies'
   */
  addDependencies(dependencies: Array<DependencyReference>, buildOptions: BuildOptions) {
    if (!Array.isArray(dependencies)) {
      dependencies = [dependencies];
    }

    const { browser = true, ignoredFiles = [], watchOnly = false } = buildOptions;
    const { fileFactory } = this.options;
    const resolveOptions = {
      browser: this.options.browser,
      cache: this.options.resolverCache,
      fileExtensions: this.options.fileExtensions
    };

    dependencies.forEach(dependency => {
      // Inlined/sidecar dependencies are pre-resolved
      let filepath = dependency.filepath;

      if (isInvalid(filepath) || !exists(filepath)) {
        filepath = resolve(this.filepath, dependency.id, resolveOptions);
      }

      // Unable to resolve filepath or create instance
      if (filepath === '') {
        dependency.isUnresolved = true;
        this.hasUnresolvedDependencies = true;
        warn(`dependency ${strong(dependency.id)} for ${strong(this.relpath)} not found`, this.options.level);
        return;
      }

      this.dependencyReferences.push(dependency);

      // Handle disabled, including native modules (force ignore of node_modules when watch only build)
      if (filepath === false || (watchOnly && filepath.includes('node_modules'))) {
        // Don't disable native modules on server
        dependency.isDisabled = browser ? true : !nativeModules.includes(dependency.id);
        return;
      }

      const file = (dependency.file = fileFactory(filepath, this.options));

      // Ignore if parent file or ignored child file
      if (file.isLocked || ignoredFiles.includes(filepath)) {
        dependency.isIgnored = true;
        return;
      }

      // Identify as inline-source dependency
      file.isInline = 'stack' in dependency;

      // Handle own dependency
      if (!file.isDependency) {
        file.isDependency = true;
        this.dependencies.push(file);
      }
    });
  }

  /**
   * Retrieve parsed workflows for 'buildOptions'
   */
  parseWorkflow(type: string, buildOptions: BuildOptions): Array<string> {
    if (this.workflows[type] == null) {
      return [];
    }

    // Backwards compat with nested array
    const workflow = Array.isArray(this.workflows[type][0]) ? this.workflows[type][0] : this.workflows[type];

    return workflow.reduce((tasks, task) => {
      if (task.includes(':')) {
        const conditions = task.split(':');

        task = conditions.pop();
        const passed = conditions.every(condition => {
          const negative = condition.charAt(0) === '!';

          condition = negative ? condition.slice(1) : condition;
          const test = condition in buildOptions ? buildOptions[condition] : this[condition];

          return negative ? !test : test;
        });

        if (!passed) {
          return tasks;
        }
      }
      tasks.push(task);
      return tasks;
    }, []);
  }

  /**
   * Run workflow set based on 'type' and 'buildOptions'
   */
  run(type: string, buildOptions: BuildOptions, fn: (?Error) => void) {
    type = buildOptions.watchOnly && !type.includes('Watch') ? type + 'Watch' : type;
    if (this.isInline && type === 'standard') {
      type = 'inlineable';
    }
    if (this.workflows[type] == null) {
      return void fn();
    }

    const workflow = this.parseWorkflow(type, buildOptions);
    const tasks = workflow.map(task => {
      return task === 'runForDependencies'
        ? callable(this, task, type, this.dependencies, buildOptions)
        : callable(this, task, buildOptions);
    });

    series(tasks, err => {
      if (err != null) {
        return fn(err);
      }
      fn();
    });
  }

  /**
   * Run workflow tasks for 'type' on dependencies
   */
  runForDependencies(type: string, dependencies?: Array<File>, buildOptions: BuildOptions, fn: (?Error) => void) {
    dependencies = dependencies || this.dependencies;
    if (isEmptyArray(dependencies)) {
      return void fn();
    }

    parallel(dependencies.map(dependency => callable(dependency, 'run', type, buildOptions)), fn);
  }

  /**
   * Read file content
   */
  readFileContent(): string {
    let content = ' ';

    if (!this.isDummy) {
      try {
        content = readFile(this.filepath, this.encoding);
      } catch (err) {
        warn(`unable to find file ${strong(this.filepath)}`, this.options.level);
      }
    }

    if (typeof content === 'string') {
      content = content.replace(RE_WIN_LINE_ENDINGS, '\n');
      content = sourceMapCommentStrip(content);
    }

    return content;
  }

  /**
   * Hash 'content'
   */
  hashContent(forWrite: boolean = false): string {
    return forWrite
      ? md5([this, ...this.getAllDependencies()].map(file => file.content).join(''))
      : md5(this.content || this.fileContent);
  }

  /**
   * Read and store file contents
   */
  load(buildOptions?: BuildOptions, fn?: (?Error) => void) {
    if (isInvalid(this.fileContent)) {
      this.fileContent = this.readFileContent();
      this.hash = this.hashContent(false);

      debug(`load: ${strong(this.relpath)}`, 4);
    }

    this.setContent(this.fileContent);
    if (this.hasMaps) {
      this.setMap();
    }

    if (fn != null) {
      fn();
    }
  }

  /**
   * Parse file contents for dependency references [no-op]
   */
  parse(buildOptions: BuildOptions, fn: (?Error) => void) {
    warn(`no parser for: ${strong(this.relpath)}`, this.options.level);
    fn();
  }

  /**
   * Compile file contents [no-op]
   */
  compile(buildOptions: BuildOptions, fn: (?Error) => void) {
    warn(`no compiler for: ${strong(this.relpath)}`, this.options.level);
    fn();
  }

  /**
   * Compress file contents [no-op]
   */
  compress(buildOptions: BuildOptions, fn: (?Error) => void) {
    warn(`no compressor for: ${strong(this.relpath)}`, this.options.level);
    fn();
  }

  /**
   * Prepare for writing
   */
  prepareForWrite(filepath: string, buildOptions: BuildOptions) {
    const { sourceroot, webroot } = this.options;

    this.writeDate = Date.now();
    this.writeHash = this.hashContent(true);

    // Generate unique path
    if (isUniqueFilepath(filepath)) {
      // Disable during watch otherwise css reloading won't work
      filepath = generateUniqueFilepath(filepath, !this.options.runtimeOptions.watch ? this.writeHash : false);
    }

    mkdir(filepath);
    this.writepath = filepath;
    this.writeUrl = `/${path.relative(webroot, filepath).replace(path.sep, '/')}`;
    this.mapUrl = (!isInvalid(sourceroot) ? `${sourceroot}/` : '') + path.basename(this.writepath) + '.map';
  }

  /**
   * Write file contents to disk
   */
  write(buildOptions: BuildOptions, fn: (?Error, ?WriteResult) => void) {
    this.run('writeable', buildOptions, err => {
      if (err != null) {
        return fn(err);
      }

      if (this.hasMaps && this.map != null) {
        writeFile(`${this.writepath}.map`, this.map.toString(), 'utf8');
        if (typeof this.content === 'string') {
          this.content += `${buildOptions.compress ? '' : '\n\n\n'}//# sourceMappingURL=${this.mapUrl}`;
        }
      }

      writeFile(this.writepath, this.content, this.encoding);

      fn(null, {
        content: this.content,
        filepath: this.writepath,
        type: this.type
      });
    });
  }

  /**
   * Reset content
   */
  reset(hard?: boolean) {
    this.allDependencies = null;
    this.allDependencyReferences = null;
    this.date = Date.now();
    this.dependencies = [];
    this.dependencyReferences = [];
    this.hasUnresolvedDependencies = false;
    this.isDependency = false;
    this.isInline = false;
    this.isLocked = false;
    this.mapUrl = '';
    this.writepath = '';
    this.writeDate = 0;
    this.writeHash = '';
    this.writeUrl = '';
    if (!hard) {
      this.setContent(this.fileContent);
    } else {
      this.content = '';
      this.fileContent = '';
      this.hash = '';
    }
    debug(`reset${hard ? '(hard):' : ':'} ${strong(this.relpath)}`, 4);
  }

  /**
   * Destroy instance
   */
  destroy() {
    this.reset(true);
    delete this.options;
  }
};
