'use strict';

const async = require('async')
  , chalk = require('chalk')
  , clearIDCache = require('identify-resource').clearCache
  , clearTemplateCache = require('./helpers/compile').clearCache
  , cnsl = require('./utils/cnsl')
  , compact = require('lodash/compact')
  , difference = require('lodash/difference')
  , distinct = require('lodash/uniq')
  , fileFactory = require('./file')
  , flatten = require('lodash/flatten')
  , fs = require('fs')
  , merge = require('lodash/merge')
  , path = require('path')
  , pathname = require('./utils/pathname')
  , recurfs = require('recur-fs')
  , unique = require('./utils/unique')

  , debug = cnsl.debug
  , indir = recurfs.indir
  , parallel = async.parallel
  , print = cnsl.print
  , readdir = recurfs.readdir.sync
  , series = async.series
  , strong = cnsl.strong
  , warn = cnsl.warn
  , waterfall = async.waterfall;

/**
 * Target instance factory
 * @param {Object} props
 * @param {Object} options
 * @returns {Target}
 */
module.exports = function targetFactory (props, options) {
  var instance = new Target(props, options);

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
    this.boilerplate = false;
    this.hasChildren = false;
    this.hasParent = false;
    this.input = '';
    this.isRoot = false;
    this.inputpath = '';
    this.appServer = false;
    this.batch = false;
    this.modular = false;
    this.output = '';
    this.outputpath = '';
    this.parent = null;
    this.sources = null;
    this.targets = null;
  */
    merge(this, props);
    this.options = options;
    this.referencedFiles = [];

    // Prepare file filter
    if (options.fileExtensions) {
      let exts = [];

      for (const type in options.fileExtensions) {
        exts = exts.concat(options.fileExtensions[type]);
      }
      this.fileFilter = new RegExp(exts.join('$|') + '$');
    }

    // Print
    if (this.isRoot) {
      debug('created root Target instance');
    } else {
      // Handle printing long input arrays
      if (Array.isArray(this.inputpath)) {
        this.inputString = this.inputpath.map((input) => {
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
        this.inputString = pathname(this.inputpath);
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
    } else if (this.outputpath || !this.outputpath && this.options.runtimeOptions.watch) {
      const timerID = Array.isArray(this.input)
          ? this.input[0]
          : this.input;

      let watching = this.options.runtimeOptions.watch ? 1 : 0;

      if (watching && !this.outputpath) watching++;

      this.referencedFiles = [];

      cnsl.start(timerID);

      print((watching == 2 ? 'watching ' : 'building ')
        + strong(this.inputString)
        + (this.outputpath ? ' to ' + strong(path.basename(this.outputpath)) : ''), 1);

      // Execute 'before' hook
      waterfall([(done) => {
        this.executeHook('before', this, done);
      },

      // Parse source files
      (done) => {
        done(null, this.parse(this.batch, this.inputpath, this.fileFilter, this.options));
      },

      // Process files
      (files, done) => {
        this.process(files, this.options.workflows, watching, done);
      },

      // Execute 'afterEach' hooks
      (files, done) => {
        parallel(files.map((file) => {
          // Memoize
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
          + chalk.cyan((cnsl.stop(timerID) / 1000) + 's')
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
   * Parse 'input' source files
   * @param {Boolean} batch
   * @param {String|Array} input
   * @param {RegExp} filter
   * @param {Object} options
   * @returns {Array}
   */
  parse (batch, input, filter, options) {
    filter = filter || /./;

    const factory = (filepath) => {
      return fileFactory(filepath, options);
    };

    let files = [];

    // Input is directory or array
    if (batch) {
      // Grab all files (filtered by file extension)
      const inputs = !Array.isArray(input) ? [input] : input
        , filepaths = flatten(inputs.map((input) => {
            // Directory
            if (!path.extname(input).length) {
              return readdir(input, (resource, stat) => {
                return stat.isFile() && filter.test(resource);
              });
            }

            return input;
          }));

      // Create file instances
      files = filepaths
        .map(factory)
        .filter((file) => {
          return file != null;
        });
      if (!files.length) warn('no valid source files found in ' + strong(input), 4);

    // Input is file
    } else {
      let file;

      // Create File instance
      if (file = factory(input)) {
        files = [file];
      } else {
        warn(strong(input) + ' not found in project sources', 4);
      }
    }

    return files;
  }

  /**
   * Process batch workflow 'commands' for 'files'
   * @param {Array} files
   * @param {Object} workflows
   * @param {Boolean} watching
   * @param {Function} fn(err, files)
   */
  process (files, workflows, watching, fn) {
    const self = this;

    let options = {
      bootstrap: this.bootstrap,
      boilerplate: this.boilerplate,
      includeHeader: this.modular,
      includeHelpers: this.modular,
      watching
    };

    // Recursive batch run 'someFiles'
    function run (someFiles, step, done) {
      if (!someFiles.length) done(null, files);
      parallel(someFiles.map((file) => {
        const type = file.isInline ? 'inline' : 'std';

        // Memoize
        return file.run.bind(file, self.parseWorkflow(workflows[file.type][type][step]), options);
      }), (err, dependencies) => {
        if (err) return done(err);

        // Process files not yet processed
        dependencies = difference(distinct(compact(flatten(dependencies))), files);
        if (dependencies.length) {
          // Store
          files = files.concat(dependencies);
          return run(dependencies, step, done);
        }

        done(null, files);
      });
    }

    // Batch run first set of workflow tasks
    run(files, 0, (err) => {
      if (err) return fn(err);

      // Store all referenced files
      this.referencedFiles = files;

      run(files, 1, (err) => {
        if (err) return fn(err);

        const inlineableFiles = files.filter((file) => {
          return file.isInlineRoot;
        });

        // Writeable files
        files = files.filter((file) => {
          // Don't filter project files if non-modular batch job
          return file.getIsWriteable(!this.modular && this.batch);
        });

        // Treat inlineable files as writable
        if (inlineableFiles.length) {
          options.includeHeader = false;
          run(inlineableFiles, 2, (err) => {
            if (err) return fn(err);
            options.includeHeader = this.modular;
            run(files, 2, fn);
          });
        } else {
          run(files, 2, fn);
        }
      });
    });
  }

  /**
   * Parse conditional 'workflow' tasks
   * @param {Array} workflow
   * @returns {Array}
   */
  parseWorkflow (workflow) {
    return workflow.reduce((result, task) => {
      if (!~task.indexOf(':')) {
        result.push(task);
      // Conditional task
      } else {
        const conditions = task.split(':');

        task = conditions.pop();
        if (this[conditions[0]]
          && (conditions.length > 1 ? this[conditions[1]] : true)) {
            result.push(task);
        }
      }
      return result;
    }, []);
  }

  /**
   * Write generated content
   * @param {Array} files
   * @returns {Array}
   */
  write (files) {
    // Write files in sequence
    return files
      .filter((file) => {
        return !file.isInline;
      })
      .map((file) => {
        // Don't write if no output path
        if (this.outputpath) {
          let filepath = this.outputpath;

          // Resolve output path if directory
          if (!path.extname(filepath).length) {
            const outputInSources = this.sources.some((source) => {
              return indir(source, this.outputpath);
            });

            // Swap input for output path if in sources in order to preserve relative package structure
            if (outputInSources) {
              // TODO: find common root directory in case of Array/glob etc
              let input = Array.isArray(this.inputpath) ? file.filepath : this.inputpath;

              // Resolve directory if input is a file
              if (path.extname(input).length) input = path.dirname(input);
              filepath = file.filepath.replace(input, this.outputpath);
            } else {
              let id = file.id;

              // Find id relative to source dir
              this.sources.forEach((source) => {
                if (~file.filepath.indexOf(source)) {
                  id = path.relative(source, file.filepath);
                }
              });

              filepath = path.join(filepath, id);
            }

            const extension = path.extname(filepath);

            // Resolve missing extension
            if (!extension) filepath += '.' + file.type;
            if (file.type != 'image' && extension != '.' + file.type) filepath = filepath.replace(extension, '.' + file.type);
          }

          // Handle generating unique paths
          if (unique.isUniquePattern(filepath)) {
            // Remove existing
            const existing = unique.find(filepath);

            if (existing && fs.existsSync(existing)) fs.unlinkSync(existing);

            // Generate unique path
            // Disable during watch otherwise css reloading won't work
            filepath = unique.generate(filepath, !this.options.runtimeOptions.watch ? file.content : false);
          }

          // Write file
          return file.write(filepath);
        }
      });
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