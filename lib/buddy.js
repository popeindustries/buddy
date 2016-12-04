'use strict';

const { spawn } = require('child_process');
const cache = require('./cache');
const callable = require('./utils/callable');
const chalk = require('chalk');
const cnsl = require('./utils/cnsl');
const compact = require('lodash/compact');
const configFactory = require('./config');
const flatten = require('lodash/flatten');
const path = require('path');
const series = require('async/series');
const stopwatch = require('./utils/stopwatch');

const { BELL, debug, error, print, strong } = cnsl;
let serverfarm = null;

/**
 * Buddy instance factory
 * @param {String|Object} configpath [file name | JSON Object]
 * @param {Object} runtimeOptions
 *  - {Boolean} compress
 *  - {Boolean} debug
 *  - {Boolean} deploy
 *  - {Boolean} grep
 *  - {Boolean} invert
 *  - {Boolean} maps
 *  - {Boolean} reload
 *  - {Boolean} script
 *  - {Boolean} serve
 *  - {Boolean} watch
 * @returns {Buddy}
 */
module.exports = function buddyFactory (configpath, runtimeOptions) {
  return new Buddy(configpath, runtimeOptions);
};

class Buddy {
  /**
   * Constructor
   * Initialize based on configuration located at 'configpath'
   * The directory tree will be walked if no 'configpath' specified
   * @param {String|Object} configpath [file name | JSON Object]
   * @param {Object} runtimeOptions
   *  - {Boolean} compress
   *  - {Boolean} debug
   *  - {Boolean} deploy
   *  - {Boolean} grep
   *  - {Boolean} invert
   *  - {Boolean} maps
   *  - {Boolean} reload
   *  - {Boolean} script
   *  - {Boolean} serve
   *  - {Boolean} watch
   */
  constructor (configpath, runtimeOptions = {}) {
    // Set console behaviour
    cnsl.verbose = runtimeOptions.debug;

    this.building = false;
    this.config = configFactory(configpath, runtimeOptions);
    this.builds = this.config.builds;
    this.onFileCacheChange = this.onFileCacheChange.bind(this);

    cache.on('change', this.onFileCacheChange);
  }

  /**
   * Build sources based on build targets specified in config
   * @param {Function} fn
   * @returns {Buddy}
   */
  build (fn) {
    stopwatch.start('build');

    // Build targets
    this.run(this.builds, (err, filepaths) => {
      if (err) return fn ? fn(err) : error(err, 2);
      print(`done in ${chalk.cyan(stopwatch.stop('build', true))}`, 0);
      // Run script
      this.executeScript();
      if (fn) fn(null, filepaths);
    });

    return this;
  }

  /**
   * Build sources and watch for changes
   * @param {Function} fn
   * @returns {Buddy}
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

    return this;
  }

  /**
   * Destroy
   */
  destroy () {
    if (serverfarm) serverfarm.stop();
    if (this.config) this.config.destroy();
    this.config = null;
    this.builds = [];
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

      stopwatch.start('watch');

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
        print(`done in ${chalk.cyan(stopwatch.stop('watch', true))}`, 0);
        // Run test script
        this.executeScript();
      });
    }
  }
}