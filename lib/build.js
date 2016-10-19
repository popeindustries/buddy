'use strict';

const { debug, print, start, stop, strong, warn } = require('./utils/cnsl');
const { truncate } = require('./utils/string');
const callable = require('./utils/callable');
const chalk = require('chalk');
const env = require('./utils/env');
const flatten = require('lodash/flatten');
const fs = require('fs');
const merge = require('lodash/merge');
const parallel = require('async/parallel');
const path = require('path');
const pathname = require('./utils/pathname');
const series = require('async/series');
const uniqueFilepath = require('./utils/uniqueFilepath');
const waterfall = require('async/waterfall');

const MAX_INPUT_STRING_LENGTH = 3;

/**
 * Build instance factory
 * @param {Object} props
 *  - {Boolean} batch
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
 *  - {Number} level
 *  - {String} output
 *  - {Array} outputpaths
 *  - {Object} runtimeOptions
 *  - {String} type
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
   *  - {Boolean} batch
   *  - {Boolean} bootstrap
   *  - {Boolean} browser
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
   *  - {Number} level
   *  - {String} output
   *  - {Array} outputpaths
   *  - {Object} runtimeOptions
   *  - {String} type
   *  - {Boolean} watchOnly
   *  - {Boolean} writeableFilterFlag
   */
  constructor (props) {
    merge(this, props);
    this.id = this.label || this.index != null && this.index.toString();
    this.referencedFiles = [];
    this.processFilesOptions = {
      batch: !this.bundle && this.batch,
      // TODO: should only parent include?
      boilerplate: true,
      bootstrap: this.bootstrap,
      browser: this.browser,
      bundle: this.bundle,
      compress: this.runtimeOptions.compress,
      // TODO: should only parent include?
      helpers: true,
      ignoredFiles: this.childInputpaths,
      watchOnly: this.watchOnly
    };

    // Handle printing long input arrays
    if (this.inputpaths.length > 1) {
      this.inputString = this.inputpaths.map((input) => pathname(input));
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

    if (this.outputpaths) {
      this.outputString = this.outputpaths.map((output) => path.relative(process.cwd(), output)).join(', ');
    }

    debug(`created Build instance with input: ${strong(this.inputString)} and output: ${strong(this.output)}`, 2);
  }

  /**
   * Determine if 'file' is a referenced file (child targets included)
   * @param {File} file
   * @returns {Boolean}
   */
  hasFile (file) {
    if (this.referencedFiles.includes(file)) return true;
    if (this.hasChildren) return this.build.some((build) => build.hasFile(file));

    return false;
  }

  /**
   * Run build
   * @param {Function} fn(err, results)
   * @returns {null}
   */
  run (fn) {
    // Skip if watch only and not running a watch build
    if (this.watchOnly && !this.runtimeOptions.watch) return fn();

    const timerID = this.inputpaths[0];
    const type = this.watchOnly && this.runtimeOptions.watch ? 'watching' : 'building';

    this.referencedFiles = [];

    start(timerID);

    print(`${type} ${strong(this.inputString)} ${this.outputString ? 'to ' + strong(this.outputString) : ''}`, 1 + this.level);

    waterfall([
      // Init file instances
      callable(this, 'initFiles', this.inputpaths),
      // Process files
      callable(this, 'processFiles'/* , files */),
      // Print
      callable(this, 'printProgress', timerID/* , referencedFiles */),
      // Write files
      callable(this, 'writeFiles'/* , referencedFiles */),
      // Build child targets
      callable(this, 'runChildren'/* , referencedFiles, results */),
      // Reset
      callable(this, 'reset'/* , referencedFiles, results */)
    ], fn);
  }

  /**
   * Parse source 'filepaths'
   * @param {Array} filepaths
   * @param {Function} fn(err, files)
   */
  initFiles (filepaths, fn) {
    fn(null, filepaths.reduce((files, filepath) => {
      const file = this.fileFactory(filepath);

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
      (err) => {
        if (err) return fn(err);
        this.referencedFiles = files.reduce((referencedFiles, file) => {
          referencedFiles.push(file);
          file.getAllDependencies()
            .forEach((dependency) => {
              if (!referencedFiles.includes(dependency)) referencedFiles.push(dependency);
            });
          return referencedFiles;
        }, []);
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
      + ']', 2 + this.level);
    fn(null, files);
  }

  /**
   * Write content for 'files'
   * @param {Array} files
   * @param {Function} fn(err, files, results)
   */
  writeFiles (files, fn) {
    const writeable = files
      .filter((file) => file.isWriteable(this.processFilesOptions.batch))
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
          if (uniqueFilepath.isUniquePattern(filepath)) {
            // Remove existing
            const existing = uniqueFilepath.findFile(filepath);

            if (existing && fs.existsSync(existing)) fs.unlinkSync(existing);

            // Generate unique path
            // Disable during watch otherwise css reloading won't work
            filepath = uniqueFilepath.generate(filepath, !this.runtimeOptions.watch ? file.content : false);
          }

          writeable.push(callable(file, 'write', filepath, this.processFilesOptions));
        }

        return writeable;
      }, []);

    // Results are [{ filepath, hash, date }]
    parallel(writeable, (err, results) => {
      if (err) return fn(err);

      env('OUTPUT', results.map((result) => result.filepath), this.id);
      env('OUTPUT_HASH', results.map((result) => result.hash), this.id);
      env('OUTPUT_DATE', results.map((result) => result.date), this.id);

      results.forEach((result) => {
        const relpath = truncate(path.relative(process.cwd(), result.filepath));

        print(chalk.green(`built${this.runtimeOptions.compress ? ' and compressed' : ''} ${strong(relpath)}`), 2 + this.level);
      });

      fn(null, files, results);
    });
  }

  /**
   * Run child builds
   * @param {Array} files
   * @param {Array} results
   * @param {Function} fn(err, files, results)
   * @returns {null}
   */
  runChildren (files, results, fn) {
    if (!this.hasChildren) return fn(null, files, results);

    // Lock files to prevent inclusion in downstream targets
    this.lock(files);
    series(this.build.map((build) => callable(build, 'run')),
      (err, childResults) => {
        if (err) return fn(err);

        this.unlock(files);
        fn(null, files, results.concat(flatten(childResults || [])));
      }
    );
  }

  /**
   * Reset referenced files
   * @param {Array} files
   * @param {Array} results
   * @param {Array} fn(err, results)
   */
  reset (files, results, fn) {
    files.forEach((file) => file.reset());
    // TODO: drop this?
    // this.caches.clear();
    fn(null, results);
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
}