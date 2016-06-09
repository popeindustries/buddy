'use strict';

const async = require('async');
const chalk = require('chalk');
const clearIDCache = require('./identify-resource').clearCache;
const clearTemplateCache = require('./helpers/compile').clearCache;
const cnsl = require('./utils/cnsl');
const difference = require('lodash/difference');
const distinct = require('lodash/uniq');
const env = require('./utils/env');
const fileFactory = require('./file');
const flatten = require('lodash/flatten');
const fs = require('fs');
const merge = require('lodash/merge');
const pathname = require('./utils/pathname');
const unique = require('./utils/unique');

const debug = cnsl.debug;
const parallel = async.parallel;
const print = cnsl.print;
const series = async.series;
const strong = cnsl.strong;
const warn = cnsl.warn;
const waterfall = async.waterfall;

/**
 * Target instance factory
 * @param {Object} props
 * @param {Object} options
 * @returns {Target}
 */
module.exports = function targetFactory (props, options) {
  const instance = new Target(props, options);

  return instance;
};

class Target {
  /**
   * Constructor
   * @param {Object} props
   * @param {Object} options
   */
  constructor (props, options) {
  /* Decorated properties
    this.bootstrap = false;
    this.childInputpaths = null;
    this.hasChildren = false;
    this.hasParent = false;
    this.index = 0;
    this.input = '';
    this.isRoot = false;
    this.inputpaths = '';
    this.appServer = false;
    this.modular = false;
    this.label = '';
    this.output = '';
    this.outputpaths = '';
    this.targets = null;
    this.writeableFilterFlag = false;
  */
    merge(this, props);
    this.id = this.label || this.index != null && this.index.toString();
    this.options = options;
    this.referencedFiles = [];

    // Print
    if (this.isRoot) {
      debug('created root Target instance');
    } else {
      // Handle printing long input arrays
      if (this.inputpaths.length > 1) {
        this.inputString = this.inputpaths.map((input) => {
          return pathname(input);
        });
        // Trim long lists
        if (this.inputString.length > 3) {
          this.inputString = this.inputString.slice(0, 3).join(', ')
            + '...and '
            + (this.inputString.length - 3)
            + ' others';
        } else {
          this.inputString = this.inputString.join(', ');
        }
      } else {
        this.inputString = pathname(this.inputpaths[0]);
      }

      debug('created Target instance with input: '
        + strong(this.inputString)
        + ' and output: '
        + strong(this.output), 2);
    }
  }

  /**
   * Run build
   * @param {Function} fn(err, filepaths)
   */
  build (fn) {
    if (this.isRoot) {
      // Execute 'before' hook
      waterfall([(done) => {
        this.executeHook('before', this, done);
      },

      // Build targets
      (done) => {
        series(this.targets.map((target) => {
          return target.build.bind(target);
        }), (err, results) => {
          done(err, flatten(results));
        });
      },

      // Execute 'after' hook
      (filepaths, done) => {
        this.executeHook('after', this, (err) => {
          done(err, filepaths);
        });
      }], fn);

    // Skip if watch only and not watch build
    } else if (this.output || !this.output && this.options.runtimeOptions.watch) {
      const timerID = this.inputpaths[0];
      let watching = this.options.runtimeOptions.watch ? 1 : 0;

      if (watching && !this.output) watching++;

      this.referencedFiles = [];

      cnsl.start(timerID);

      print((watching == 2 ? 'watching ' : 'building ')
        + strong(this.inputString)
        + (this.output ? ' to ' + strong(this.output) : ''), 1);

      // Execute 'before' hook
      waterfall([(done) => {
        this.executeHook('before', this, done);
      },

      // Parse into file instances
      (done) => {
        done(null, this.parseFiles(this.inputpaths, this.options));
      },

      // Process files
      (files, done) => {
        env('INPUT', files, this.id);
        env('INPUT_HASH', files, this.id);
        env('INPUT_DATE', files, this.id);
        this.process(files, this.options.workflows, watching, (err, files) => {
          if (err) return done(err);
          this.referencedFiles = files;
          done(null, files.filter((file) => {
            return file.isWriteable(this.writeableFilterFlag) && !file.isInlineable();
          }));
        });
      },

      // Execute 'afterEach' hooks
      (files, done) => {
        parallel(files.map((file) => {
          return this.executeHook.bind(this, 'afterEach', file);
        }), (err) => {
          done(err, files);
        });
      },

      // Write writeable files
      (files, done) => {
        print('[processed '
          + strong(this.referencedFiles.length)
          + (this.referencedFiles.length > 1 ? ' files' : ' file')
          + ' in '
          + chalk.cyan(cnsl.stop(timerID) + 'ms')
          + ']', 2);
        done(null, this.write(files));
      },

      // Build child targets
      (filepaths, done) => {
        if (this.hasChildren) {
          // Lock files to prevent inclusion in downstream targets
          this.lock(this.referencedFiles);
          series(this.targets.map((target) => {
            return target.build.bind(target);
          }), (err, results) => {
            // Add new filepaths
            filepaths = filepaths.concat(flatten(results));
            this.unlock(this.referencedFiles);
            done(err, filepaths);
          });
        } else {
          done(null, filepaths);
        }
      },

      // Execute 'after' hook
      (filepaths, done) => {
        this.executeHook('after', this, (err) => {
          done(err, filepaths);
        });
      },

      // Reset
      (filepaths, done) => {
        this.reset();
        done(null, filepaths);
      }], fn);

    } else {
      fn();
    }
  }

  /**
   * Parse 'inputs' source files
   * @param {Array} inputs
   * @param {Object} options
   * @returns {Array}
   */
  parseFiles (inputs, options) {
    return inputs.reduce((files, filepath) => {
      const file = fileFactory(filepath, options);

      if (!file) {
        warn(strong(filepath) + ' not found in project source', 4);
      } else {
        files.push(file);
      }
      return files;
    }, []);
  }

  /**
   * Process batch workflow 'commands' for 'files'
   * @param {Array} files
   * @param {Object} workflows
   * @param {Boolean} watching
   * @param {Function} fn(err, processedFiles, writeableFiles)
   */
  process (files, workflows, watching, fn) {
    const options = {
      bootstrap: this.bootstrap,
      boilerplate: this.boilerplate,
      ignoredFiles: this.childInputpaths,
      includeHeader: this.modular,
      includeHelpers: !this.hasParent && this.modular,
      watching
    };

    // Recursively run 'files' through 'workflow'
    const runWorkflow = (runnableFiles, workflow, done) => {
      parallel(runnableFiles.map((file) => {
        // Memoize
        return file.run.bind(file, this.parseWorkflow(workflow, file), options);
      }), (err, dependencies) => {
        if (err) return done(err);
        // Filter unique, unprocessed files
        dependencies = difference(distinct(flatten(dependencies)), files);
        if (dependencies.length) {
          // Store
          files = files.concat(dependencies);
          runWorkflow(dependencies, workflow, done);
        } else {
          done();
        }
      });
    };

    series(workflows.map((workflow) => {
      return (done) => {
        runWorkflow(files, workflow, done);
      };
    }), (err) => {
      if (err) return fn(err);
      fn(null, files);
    });
  }

  /**
   * Parse 'workflow' tasks for 'file',
   * @param {Object} workflow
   * @param {File} file
   * @returns {Array}
   */
  parseWorkflow (workflow, file) {
    return workflow[file.type].reduce((workflow, task) => {
      if (!~task.indexOf(':')) {
        workflow.push(task);
      // Conditional task
      } else {
        let conditions = task.split(':');

        task = conditions.pop();

        const passed = conditions.reduce((passed, condition) => {
          if (!passed) return false;
          return condition in this && this[condition]
            || condition in this.options.runtimeOptions && this.options.runtimeOptions[condition]
            || condition == 'inlineable' && file.isInlineable()
            || condition == 'writeable' && file.isWriteable(this.writeableFilterFlag);
        }, true);

        if (passed) workflow.push(task);
      }
      return workflow;
    }, []);
  }

  /**
   * Write generated content
   * @param {Array} files
   * @returns {Array}
   */
  write (files) {
    const written = files.reduce((written, file) => {
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
          filepath = unique.generate(filepath, !this.options.runtimeOptions.watch ? file.content : false);
        }

        // Returns [filepath, hash, date]
        written.push(file.write(filepath));
      }

      return written;
    }, []);

    const filepaths = written.map((item) => item[0]);

    env('OUTPUT', filepaths, this.id);
    env('OUTPUT_HASH', written.map((item) => item[1]), this.id);
    env('OUTPUT_DATE', written.map((item) => item[2]), this.id);

    return filepaths;
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
      for (let i = 0, n = this.targets.length; i < n; i++) {
        if (this.targets[i].hasFile(file)) return true;
      }
    }

    return false;
  }

  /**
   * Reset modified files
   */
  reset () {
    this.referencedFiles.forEach((file) => {
      file.reset();
    });
    clearIDCache();
    clearTemplateCache();
  }

  /**
   * Execute the 'hook' function with a particular 'context'
   * @param {String} hook
   * @param {Object} context
   * @param {Function} fn(err)
   */
  executeHook (hook, context, fn) {
    if (this[hook]) {
      print('executing ' + hook + ' hook...', 2);
      // Make global objects available to the function
      this[hook](global, process, console, require, context, this.options.runtimeOptions, fn);
    } else {
      fn();
    }
  }
}