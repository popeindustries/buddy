'use strict';

const { spawn } = require('child_process');
const buildFactory = require('./build');
const cache = require('./cache');
const callable = require('./utils/callable');
const chalk = require('chalk');
const cnsl = require('./utils/cnsl');
const compact = require('lodash/compact');
const configFactory = require('./config');
const flatten = require('lodash/flatten');
const path = require('path');
const series = require('async/series');

const { BELL, debug, error, print, start, stop, strong } = cnsl;
let serverfarm = null;

/**
 * Buddy instance factory
 * @param {String|Object} configpath [file name | JSON Object]
 * @param {Object} options
 * @returns {Buddy}
 */
module.exports = function buddyFactory (configpath, options) {
  return new Buddy(configpath, options);
};

class Buddy {
  /**
   * Constructor
   * Initialize based on configuration located at 'configpath'
   * The directory tree will be walked if no 'configpath' specified
   * @param {String|Object} configpath [file name | JSON Object]
   * @param {Object} runtimeOptions
   */
  constructor (configpath, runtimeOptions = {}) {
    // Set console behaviour
    cnsl.verbose = runtimeOptions.debug;

    this.building = false;
    this.config = configFactory(configpath, runtimeOptions);

    cache.on('change', this.onFileCacheChange.bind(this));

    // Initialize builds
    this.builds = this.initBuilds(this.config.build, runtimeOptions);
  }

  /**
   * Build sources based on build targets specified in config
   * @param {Function} fn
   */
  build (fn) {
    start('build');

    // Build targets
    this.run(this.builds, (err, filepaths) => {
      if (err) return fn ? fn(err) : error(err, 2);
      print(`done in ${chalk.cyan((stop('build') / 1000) + 's')}`, 0);
      // Run script
      this.executeScript();
      if (fn) fn(null, filepaths);
    });
  }

  /**
   * Build sources and watch for changes
   * @param {Function} fn
   */
  watch (fn) {
    // Build first
    this.build((err, filepaths) => {
      if (err) return fn ? fn(err) : error(err, 2);

      if (this.config.runtimeOptions.reload || this.config.runtimeOptions.serve) {
        serverfarm = require('./utils/serverfarm');
        // Start servers
        serverfarm.start(this.config.runtimeOptions.serve, this.config.runtimeOptions.reload, this.config.server, (serverError) => {
          if (serverError) { /* Ignore and keep watching */ }
        });
      } else {
        print('watching files for changes:', 1);
      }
    });
  }

  /**
   * Cleanup after unhandled exception
   */
  exceptionalCleanup () {
    if (serverfarm) serverfarm.stop();
  }

  /**
   * Reset
   */
  destroy () {
    this.exceptionalCleanup();
    this.config.destroy();

    this.config = null;
    this.builds = [];
  }

  /**
   * Recursively initialize all valid build instances
   * @param {Array} builds
   * @param {Object} runtimeOptions
   * @returns {Array}
   */
  initBuilds (builds, runtimeOptions) {
    const init = (builds, isChild) => {
      return builds.map((build) => {
        const instance = buildFactory(build);

        // Traverse
        if (instance.hasChildren) instance.build = init(instance.build, true);
        return instance;
      });
    };

    return init(builds);
  }

  /**
   * Run all build targets
   * @param {Array} builds
   * @param {Function} fn(err, filepaths)
   */
  run (builds, fn) {
    this.building = true;

    // Execute builds in sequence
    series(builds.map((build) => callable(build, 'run')),
      (err, results) => {
        if (err) return fn(err);

        this.building = false;
        fn(null, compact(flatten(results)).map((result) => result.filepath));
      }
    );
  }

  /**
   * Run the script defined in config 'script'
   */
  executeScript () {
    let hasErrored = false;
    let args, command, script;

    if (this.config.runtimeOptions.script && (script = this.config.script)) {
      script = script.split(' ');
      command = script.shift();
      args = script;

      print('executing script...', 1);
      debug(`execute: ${strong(this.config.script)}`, 3);

      script = spawn(command, args, { cwd: process.cwd() });

      script.stdout.on('data', (data) => {
        process.stdout.write(data.toString());
      });

      script.stderr.on('data', (data) => {
        process.stderr.write(data.toString());
        hasErrored = true;
      });

      script.on('close', (code) => {
        if (hasErrored) process.stderr.write(BELL);
      });
    }
  }

  /**
   * Handle cache changes
   * @param {String} filepath
   */
  onFileCacheChange (filepath) {
    const now = new Date();
    const builds = this.builds.filter((build) => build.hasFile(filepath));
    // Determine if any changes to app server code that needs a restart
    const servers = builds.filter((build) => build.isAppServer);

    if (!this.building) {
      print(`[${now.toLocaleTimeString()}] ${chalk.yellow('changed')} ${strong(filepath)}`, 0);

      start('watch');

      this.run(builds, (err, filepaths) => {
        // Don't throw
        if (err) return error(err, 2, false);
        if (serverfarm) {
          // Trigger partial refresh if only 1 css file, full reload if not
          const filepath = (filepaths.length == 1 && path.extname(filepaths[0]) == '.css')
            ? filepaths[0]
            : 'foo.js';

          // Refresh browser
          if (!servers.length) {
            serverfarm.refresh(path.basename(filepath));
          } else {
            // Restart app server
            serverfarm.restart((err) => {
              if (err) console.log(err);
              // Refresh browser
              serverfarm.refresh(path.basename(filepath));
            });
          }
        }
        print(`done in ${chalk.cyan((stop('watch') / 1000) + 's')}`, 0);
        // Run test script
        this.executeScript();
      });
    }
  }
}