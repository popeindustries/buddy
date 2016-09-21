'use strict';

const { debug, print, start, stop, strong, warn } = require('./utils/cnsl');
const { parallel, series, waterfall } = require('async');
const callable = require('./utils/callable');
const chalk = require('chalk');
const distinct = require('lodash/uniq');
const env = require('./utils/env');
const flatten = require('lodash/flatten');
const fs = require('fs');
const merge = require('lodash/merge');
const pathname = require('./utils/pathname');
const unique = require('./utils/unique');

const MAX_INPUT_STRING_LENGTH = 3;

/**
 * Build instance factory
 * @param {Object} props
 *  - {Boolean} bootstrap
 *  - {Object} build
 *  - {Boolean} bundle
 *  - {Object} caches
 *  - {Array} childInputpaths
 *  - {Function} fileFactory
 *  - {Boolean} hasChildren
 *  - {Boolean} hasParent
 *  - {Number} index
 *  - {String} input
 *  - {Array} inputpaths
 *  - {Boolean} isAppServer
 *  - {String} label
 *  - {String} output
 *  - {Array} outputpaths
 *  - {Object} runtimeOptions
 *  - {Array} sources
 *  - {Boolean} watchOnly
 *  - {Boolean} writeableFilterFlag
 * @returns {Build}
 */
module.exports = function buildFactory (props) {
  return new Build(props);
};

class Build {
  /**
   * Constructor
   * @param {Object} props
   *  - {Boolean} bootstrap
   *  - {Object} build
   *  - {Boolean} bundle
   *  - {Object} caches
   *  - {Array} childInputpaths
   *  - {Function} fileFactory
   *  - {Boolean} hasChildren
   *  - {Boolean} hasParent
   *  - {Number} index
   *  - {String} input
   *  - {Array} inputpaths
   *  - {Boolean} isAppServer
   *  - {String} label
   *  - {String} output
   *  - {Array} outputpaths
   *  - {Object} runtimeOptions
   *  - {Array} sources
   *  - {Boolean} watchOnly
   *  - {Boolean} writeableFilterFlag
   */
  constructor (props) {
    merge(this, props);
    this.id = this.label || this.index != null && this.index.toString();
    this.referencedFiles = [];
    this.processFilesOptions = {
      // TODO: should only parent include?
      boilerplate: true,
      bootstrap: this.bootstrap,
      bundle: this.bundle,
      compress: this.runtimeOptions.compress,
      ignoredFiles: this.childInputpaths,
      includeHeader: this.bundle,
      includeHelpers: !this.hasParent && this.bundle,
      watchOnly: this.watchOnly
    };

    // Handle printing long input arrays
    if (this.inputpaths.length > 1) {
      this.inputString = this.inputpaths.map((input) => {
        return pathname(input);
      });
      // Trim long lists
      if (this.inputString.length > MAX_INPUT_STRING_LENGTH) {
        const remainder = this.inputString.length - MAX_INPUT_STRING_LENGTH;

        this.inputString = `${this.inputString.slice(0, MAX_INPUT_STRING_LENGTH).join(', ')} ...and ${remainder} other${remainder > 1 ? 's' : ''}`;
      } else {
        this.inputString = this.inputString.join(', ');
      }
    } else {
      this.inputString = pathname(this.inputpaths[0]);
    }

    debug(`created Build instance with input: ${strong(this.inputString)} and output: ${strong(this.output)}`, 2);
  }

  /**
   * Run build
   * @param {Function} fn(err, filepaths)
   * @returns {null}
   */
  run (fn) {
    // Skip if watch only and not running a watch build
    if (this.watchOnly && !this.runtimeOptions.watch) return fn();

    const timerID = this.inputpaths[0];
    const type = this.watchOnly && this.runtimeOptions.watch ? 'watching ' : 'building ';

    this.referencedFiles = [];

    start(timerID);

    print(`${type} ${strong(this.inputString)} ${this.output ? ' to ' + strong(this.output) : ''}`, 1);

    waterfall([
      // Execute 'before' hook
      callable(this, 'executeHook', 'before', [this], this.inputpaths),
      // Init file instances
      callable(this, 'initFiles'/* , filepaths */),
      // Process files
      callable(this, 'processFiles'/* , files */),
      // Print
      callable(this, 'printProgress', timerID/* , referencedFiles */),
      // Execute 'afterEach' hooks
      callable(this, 'executeHook', 'afterEach'/* , referencedFiles */),
      // Write files
      callable(this, 'writeFiles'/* , referencedFiles */),
      // Build child targets
      callable(this, 'runChildren'/* , writeableFilepaths */),
      // Execute 'after' hook
      callable(this, 'executeHook', 'after', [this]/* , writeableFilepaths */),
      // Reset
      callable(this, 'reset'/* , writeableFilepaths */)
    ], fn);
  }

  /**
   * Parse source 'filepaths'
   * @param {Array} filepaths
   * @param {Function} fn(err, files)
   */
  initFiles (filepaths, fn) {
    fn(null, filepaths.reduce((files, filepath) => {
      const file = this.fileFactory(filepath, this.fileFactoryOptions);

      if (!file) {
        warn(`${strong(filepath)} not found in project source`, 4);
      } else {
        files.push(file);
      }
      return files;
    }, []));
  }

  /**
   * Process 'files'
   * @param {Array} files
   * @param {Function} fn(err, files)
   */
  processFiles (files, fn) {
    env('INPUT', files, this.id);
    env('INPUT_HASH', files, this.id);
    env('INPUT_DATE', files, this.id);

    parallel(files.map((file) => callable(file, 'run', 'standard', this.processFilesOptions)),
      (err, results) => {
        if (err) return fn(err);
        this.referencedFiles = distinct(files.concat(flatten(results)));
        fn(null, this.referencedFiles);
      }
    );
  }

  /**
   * Print progress
   * @param {String} timerID
   * @param {Array} files
   * @param {Function} fn(err, files)
   */
  printProgress (timerID, files, fn) {
    print('[processed '
      + strong(files.length)
      + (files.length > 1 ? ' files' : ' file')
      + ' in '
      + chalk.cyan(stop(timerID) + 'ms')
      + ']', 2);
    fn(null, files);
  }

  /**
   * Write content for 'files'
   * @param {Array} files
   * @param {Function} fn(err, filepaths)
   */
  writeFiles (files, fn) {
    const writeable = files
      .filter((file) => file.isWriteable(this.writeableFilterFlag))
      .reduce((writeable, file) => {
        let filepath = '';

        for (let i = 0, n = this.inputpaths.length; i < n; i++) {
          if (this.inputpaths[i] == file.filepath) {
            filepath = this.outputpaths[i];
            break;
          }
        }

        // Don't write if no output path
        if (filepath) {
          // Handle generating unique paths
          if (unique.isUniquePattern(filepath)) {
            // Remove existing
            const existing = unique.find(filepath);

            if (existing && fs.existsSync(existing)) fs.unlinkSync(existing);

            // Generate unique path
            // Disable during watch otherwise css reloading won't work
            filepath = unique.generate(filepath, !this.runtimeOptions.watch ? file.content : false);
          }

          writeable.push(callable(file, 'write', filepath, this.processFilesOptions));
        }

        return writeable;
      }, []);

    // Results are [[filepath, hash, date]]
    parallel(writeable, (err, results) => {
      if (err) return fn(err);

      const filepaths = results.map((item) => item[0]);

      env('OUTPUT', filepaths, this.id);
      env('OUTPUT_HASH', results.map((item) => item[1]), this.id);
      env('OUTPUT_DATE', results.map((item) => item[2]), this.id);

      fn(null, filepaths);
    });
  }

  /**
   * Run child builds
   * @param {Array} filepaths
   * @param {Function} fn(err, filepaths)
   * @returns {null}
   */
  runChildren (filepaths, fn) {
    if (!this.hasChildren) return fn(null, filepaths);

    // Lock files to prevent inclusion in downstream targets
    this.lock(this.referencedFiles);
    series(this.build.map((build) => callable(build, 'build')),
      (err, childFilepaths) => {
        if (err) return fn(err);
        // Add new filepaths
        filepaths.push(...flatten(childFilepaths));
        this.unlock(this.referencedFiles);
        fn(filepaths);
      }
    );
  }

  /**
   * Reset referenced files
   * @param {Array} filepaths
   * @param {Array} fn(err, filepaths)
   */
  reset (filepaths, fn) {
    this.referencedFiles.forEach((file) => file.reset());
    this.caches.clear();
    fn(null, filepaths);
  }

  /**
   * Set lock flag for 'files'
   * @param {Array} files
   */
  lock (files) {
    files.forEach((file) => {
      file.isLocked = true;
    });
  }

  /**
   * Unset lock flag for 'files'
   * @param {Array} files
   */
  unlock (files) {
    files.forEach((file) => {
      file.isLocked = false;
    });
  }

  /**
   * Determine if 'file' is a referenced file (child targets included)
   * @param {File} file
   * @returns {Boolean}
   */
  hasFile (file) {
    if (~this.referencedFiles.indexOf(file)) return true;

    if (this.hasChildren) {
      for (let i = 0, n = this.build.length; i < n; i++) {
        if (this.build[i].hasFile(file)) return true;
      }
    }

    return false;
  }

  /**
   * Execute the 'hook' function for 'contexts'
   * @param {String} hook
   * @param {Array} contexts
   * @param {Object} [passthrough]
   * @param {Function} fn(err)
   * @returns {null}
   */
  executeHook (hook, contexts, passthrough, fn) {
    // Handle missing passthrough value
    if (!fn && 'function' == typeof passthrough) {
      fn = passthrough;
      passthrough = contexts;
    }
    if (!this[hook]) return fn(null, passthrough);

    print('executing ' + hook + ' hook...', 2);
    parallel(contexts.map((context) => {
      // Make global objects available to the function
      return callable(this, hook, global, process, console, require, context, this.runtimeOptions);
    }), (err) => {
      fn(err, passthrough);
    });
  }
}