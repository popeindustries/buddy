'use strict';

const { debug, print, strong, warn } = require('./utils/cnsl');
const { filepathName, findUniqueFilepath, isUniqueFilepath } = require('./utils/filepath');
const { truncate } = require('./utils/string');
const callable = require('./utils/callable');
const chalk = require('chalk');
const env = require('./utils/env');
const flatten = require('lodash/flatten');
const fs = require('fs');
const parallel = require('async/parallel');
const path = require('path');
const prettyBytes = require('pretty-bytes');
const series = require('async/series');
const stopwatch = require('./utils/stopwatch');
const waterfall = require('async/waterfall');
const zlib = require('zlib');

const RECOMMENDED_FILE_SIZE_LIMIT = 250000;
const MAX_INPUT_STRING_LENGTH = 3;

/**
 * Build instance factory
 * @param {Object} props
 *  - {Boolean} batch
 *  - {Boolean} boilerplate
 *  - {Boolean} bootstrap
 *  - {Boolean} [browser]
 *  - {Boolean} bundle
 *  - {FileCache} [fileCache]
 *  - {Function} [fileFactory]
 *  - {Number} index
 *  - {String} input
 *  - {Array} inputpaths
 *  - {Boolean} [isAppServer]
 *  - {String} label
 *  - {Number} level
 *  - {String} output
 *  - {Array} outputpaths
 *  - {Build} parent
 *  - {Object} runtimeOptions
 *  - {String} type
 *  - {Boolean} watchOnly
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
   *  - {Boolean} boilerplate
   *  - {Boolean} bootstrap
   *  - {Boolean} [browser]
   *  - {Boolean} bundle
   *  - {FileCache} [fileCache]
   *  - {Function} [fileFactory]
   *  - {Number} index
   *  - {String} input
   *  - {Array} inputpaths
   *  - {Boolean} [isAppServer]
   *  - {String} label
   *  - {Number} level
   *  - {String} output
   *  - {Array} outputpaths
   *  - {Build} parent
   *  - {Object} runtimeOptions
   *  - {String} type
   *  - {Boolean} watchOnly
   */
  constructor (props) {
    Object.assign(this, props);

    this.builds = [];
    this.childInputpaths = [];
    this.id = this.label || this.index != null && this.index.toString();
    this.inputFiles = [];
    this.processFilesOptions = {};
    this.referencedFiles = [];
    this.results = [];
    this.timerID = this.inputpaths[0];
    this.outputFiles = [];

    // Handle printing long input/output arrays
    this.inputString = generatePathString(this.inputpaths);
    this.outputString = generatePathString(this.outputpaths);

    debug(`created Build instance with input: ${strong(this.inputString)} and output: ${strong(this.output)}`, 2);
  }

  /**
   * Determine if 'filepath' is a referenced file (child targets included)
   * @param {String} filepath
   * @returns {Boolean}
   */
  hasFile (filepath) {
    if (this.referencedFiles.some((refFile) => refFile.filepath == filepath)) return true;
    if (this.builds.length) return this.builds.some((build) => build.hasFile(filepath));

    return false;
  }

  /**
   * Run build
   * @param {Function} fn(err, results)
   */
  run (fn) {
    waterfall([
      callable(this, 'runProcess'),
      callable(this, 'runWrite'),
      callable(this, 'runReset')
    ], fn);
  }

  /**
   * Run processing tasks
   * @param {Function} fn(err)
   */
  runProcess (fn) {
    waterfall([
      // Initialize
      callable(this, 'init'),
      // Process input files
      callable(this, 'processFiles'/* , files */),
      // Pre-process output files
      callable(this, 'preProcessWriteFiles'/* , files */),
      // Print process progress
      callable(this, 'printProcessProgress'/* , referencedFiles */),
      // Print process progress
      callable(this, 'runProcessForChildren'/* , referencedFiles */)
    ], fn);
  }

  /**
   * Run write tasks
   * @param {Function} fn(err)
   */
  runWrite (fn) {
    waterfall([
      // Write files
      callable(this, 'writeFiles', this.outputFiles),
      // Write file progress
      callable(this, 'printWriteProgress'/* , referencedFiles, results */),
      // Build child targets
      callable(this, 'runWriteForChildren'/* , referencedFiles, results */)
    ], fn);
  }

  /**
   * Run reset tasks
   * @param {Function} fn(err, results)
   */
  runReset (fn) {
    waterfall([
      // Reset
      callable(this, 'reset', this.results),
      // Build child targets
      callable(this, 'runResetForChildren'/* , results */)
    ], fn);
  }

  /**
   * Initialize state before run
   * @param {Function} fn(err, files)
   * @returns {null}
   */
  init (fn) {
    const type = this.watchOnly && this.runtimeOptions.watch ? 'watching' : 'building';

    this.inputFiles = [];
    this.referencedFiles = [];
    this.results = [];
    this.outputFiles = [];
    this.processFilesOptions = {
      batch: !this.bundle && this.batch,
      boilerplate: this.boilerplate,
      bootstrap: this.bootstrap,
      browser: this.browser,
      bundle: this.bundle,
      compress: this.runtimeOptions.compress,
      // TODO: only include helpers in root? Difficult on watch
      helpers: true,
      ignoredFiles: this.childInputpaths,
      importBoilerplate: false,
      watchOnly: this.watchOnly
    };

    stopwatch.start(this.timerID);

    // Skip if watch only and not running a watch build
    if (this.watchOnly && !this.runtimeOptions.watch) return fn(null, []);

    print(`${type} ${strong(this.inputString)} ${this.outputString ? 'to ' + strong(this.outputString) : ''}`, 1 + this.level);

    fn(null, this.inputpaths.reduce((files, filepath) => {
      const file = this.fileFactory(filepath);

      if (!file) {
        warn(`${strong(filepath)} not found in project source`, 4);
      } else {
        files.push(file);
        this.inputFiles.push(file);
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
   * Pre-process write files
   * @param {Array} files
   * @param {Function} fn(err, files)
   */
  preProcessWriteFiles (files, fn) {
    this.outputFiles = this.inputFiles
      .filter((file) => file.isWriteable(this.processFilesOptions.batch))
      .reduce((outputFiles, file, idx) => {
        let filepath = '';

        this.inputpaths.some((inputpath, idx) => {
          if (inputpath == file.filepath) {
            filepath = this.outputpaths[idx];
            return true;
          }
        });

        // Don't write if no output path
        if (filepath) {
          // Handle generating unique paths
          if (isUniqueFilepath(filepath)) {
            // Remove existing
            const existing = findUniqueFilepath(filepath);

            if (existing && fs.existsSync(existing)) fs.unlinkSync(existing);
          }

          file.prepareForWrite(filepath, this.processFilesOptions);
          outputFiles.push(file);
          env('OUTPUT', file, this.id);
          env('OUTPUT_HASH', file, this.id);
          env('OUTPUT_DATE', file, this.id);
          env('OUTPUT_URL', file, this.id);
        }

        return outputFiles;
      }, []);

    fn(null, files);
  }

  /**
   * Print progress
   * @param {Array} files
   * @param {Function} fn(err, files)
   */
  printProcessProgress (files, fn) {
    if (files.length) {
      print('[processed '
        + strong(files.length)
        + (files.length > 1 ? ' files' : ' file')
        + ' in '
        + chalk.cyan(stopwatch.stop(this.timerID, true))
        + ']', 2 + this.level);
    }
    fn(null, files);
  }

  /**
   * Run processing for child builds
   * @param {Array} files
   * @param {Function} fn(err)
   * @returns {null}
   */
  runProcessForChildren (files, fn) {
    if (!this.builds.length) return fn();

    // Lock files to prevent inclusion in downstream targets
    this.lock(this.referencedFiles);
    series(this.builds.map((build) => callable(build, 'runProcess')),
      (err, childFiles) => {
        if (err) return fn(err);
        this.unlock(this.referencedFiles);
        fn();
      }
    );
  }

  /**
   * Write content for 'files'
   * @param {Array} files
   * @param {Function} fn(err, files, results)
   */
  writeFiles (files, fn) {
    const writeable = files.map((file) => callable(file, 'write', this.processFilesOptions));

    // Results are [{ filepath, content }]
    parallel(writeable, (err, results) => {
      if (err) return fn(err);

      this.results = results;
      fn(null, files, results);
    });
  }

  /**
   * Print progress
   * @param {Array} files
   * @param {Array} results
   * @param {Function} fn(err, files, results)
   */
  printWriteProgress (files, results, fn) {
    const prints = results.map((result) => {
      return callable(printResult, null, result, this.runtimeOptions.deploy, this.runtimeOptions.compress, this.level);
    });

    parallel(prints, (err) => {
      fn(err, files, results);
    });
  }

  /**
   * Run write for child builds
   * @param {Array} files
   * @param {Array} results
   * @param {Function} fn(err)
   * @returns {null}
   */
  runWriteForChildren (files, results, fn) {
    if (!this.builds.length) return fn();

    // Lock files to prevent inclusion in downstream targets
    this.lock(this.referencedFiles);
    series(this.builds.map((build) => callable(build, 'runWrite')),
      (err, childResults) => {
        if (err) return fn(err);
        this.unlock(this.referencedFiles);
        fn();
      }
    );
  }

  /**
   * Reset input files
   * @param {Array} results
   * @param {Array} fn(err, results)
   */
  reset (results, fn) {
    this.referencedFiles.forEach((file) => file.reset());
    fn(null, results);
  }

  /**
   * Run reset for child builds
   * @param {Array} results
   * @param {Array} fn(err, results)
   * @returns {null}
   */
  runResetForChildren (results, fn) {
    if (!this.builds.length) return fn(null, results);

    series(this.builds.map((build) => callable(build, 'runReset')),
      (err, childResults) => {
        if (err) return fn(err);
        fn(null, results.concat(flatten(childResults || [])));
      }
    );
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

/**
 * Generate path string for 'paths'
 * @param {Array} paths
 * @returns {String}
 */
function generatePathString (paths) {
  let pathString = '';

  if (!paths || !paths.length) return pathString;

  if (paths.length > 1) {
    pathString = paths.map((pathItem) => filepathName(pathItem));
    // Trim long lists
    if (pathString.length > MAX_INPUT_STRING_LENGTH) {
      const remainder = pathString.length - MAX_INPUT_STRING_LENGTH;

      pathString = `${pathString.slice(0, MAX_INPUT_STRING_LENGTH).join(', ')} ...and ${remainder} other${remainder > 1 ? 's' : ''}`;
    } else {
      pathString = pathString.join(', ');
    }
  } else {
    pathString = filepathName(paths[0]);
  }

  return pathString;
}

/**
 * Print 'result'
 * @param {Object} result
 * @param {Boolean} isDeploy
 * @param {Boolean} isCompressed
 * @param {Number} level
 * @param {Function} fn
 */
function printResult (result, isDeploy, isCompressed, level, fn) {
  const relpath = truncate(path.relative(process.cwd(), result.filepath));

  if ((result.type == 'js' || result.type == 'css') && isDeploy) {
    zlib.gzip(result.content, (err, buffer) => {
      if (err) return fn(err);

      const stat = fs.statSync(result.filepath);
      const bytes = stat.size;
      const over = bytes > RECOMMENDED_FILE_SIZE_LIMIT;
      const overZipped = buffer.length > RECOMMENDED_FILE_SIZE_LIMIT;

      print(chalk.green(`built and compressed ${strong(relpath)}`), 2 + level);
      print(`compressed size: ${chalk[over ? 'red' : 'green'](prettyBytes(bytes))}`, 3 + level);
      print(`gzipped size: ${chalk[overZipped ? 'red' : 'green'](prettyBytes(buffer.length))}`, 3 + level);
      if (over || overZipped) {
        warn(`the output file exceeds the recommended ${strong(prettyBytes(RECOMMENDED_FILE_SIZE_LIMIT))} size`, 3 + level);
        print('Consider splitting into smaller bundles to help improve browser startup execution time', 3 + level);
      }
      fn();
    });
  } else {
    print(chalk.green(`built${isCompressed ? ' and compressed' : ''} ${strong(relpath)}`), 2 + level);
    fn();
  }
}