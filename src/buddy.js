// @flow

'use strict';

import type Build from './Build';

const { spawn } = require('child_process');
const cache = require('./cache');
const callable = require('./utils/callable');
const chalk = require('chalk');
const cnsl = require('./utils/cnsl');
const compact = require('lodash/compact');
const Config = require('./config');
const flatten = require('lodash/flatten');
const path = require('path');
const series = require('async/series');
const stopwatch = require('./utils/stopwatch');

const { BELL, debug, error, print, strong } = cnsl;
let serverfarm = null;

/**
 * Buddy instance factory
 * Initialize based on configuration located at 'configpath'
 * The directory tree will be walked if no 'configpath' specified
 */
module.exports = function buddyFactory(configpath: string | Object, options: Object): Buddy {
  return new Buddy(configpath, options);
};

class Buddy {
  building: boolean;
  config: Config;
  builds: Array<Build>;
  onFileCacheChange: string => void;

  constructor(configpath: string | Object, options: Object) {
    // Set console behaviour
    cnsl.verbose = options.debug;

    this.building = false;
    this.config = new Config(configpath, options);
    this.builds = this.config.builds || [];
    this.onFileCacheChange = this.onFileCacheChange.bind(this);

    cache.on('change', this.onFileCacheChange);
  }

  /**
   * Build sources based on build targets specified in config
   */
  build(fn?: (?Error, ?Array<string>) => void): Buddy {
    stopwatch.start('build');

    // Build targets
    this.run(this.builds, (err, filepaths) => {
      if (err != null) {
        return fn != null ? fn(err) : error(err, 2);
      }

      print(`\ndone build in ${chalk.cyan(stopwatch.stop('build', true))}\n`, 0);
      // Run script
      this.executeScript();
      if (fn != null) {
        fn(null, filepaths);
      }
    });

    return this;
  }

  /**
   * Build sources and watch for changes
   */
  watch(fn: (?Error, ?Array<string>) => void): Buddy {
    // Build first
    this.build((err, filepaths) => {
      if (err != null) {
        return fn != null ? fn(err) : error(err, 2);
      }

      if (this.config.runtimeOptions.reload || this.config.runtimeOptions.serve) {
        serverfarm = require('./utils/serverfarm');
        // Start servers
        serverfarm.start(
          this.config.runtimeOptions.serve,
          this.config.runtimeOptions.reload,
          this.config.server,
          serverError => {
            /* Ignore and keep watching */
          }
        );
      } else {
        print('watching files for changes:', 1);
      }
    });

    return this;
  }

  /**
   * Destroy
   */
  destroy() {
    if (serverfarm != null) {
      serverfarm.stop();
    }
    if (this.config != null) {
      this.config.destroy();
    }
    delete this.config;
    this.builds = [];
  }

  /**
   * Run all build targets
   */
  run(builds: Array<Build>, fn: (?Error, ?Array<string>) => void) {
    this.building = true;

    // Execute builds in sequence
    series(builds.map(build => callable(build, 'run')), (err, results) => {
      this.building = false;

      if (err != null) {
        return fn(err);
      }
      fn(null, compact(flatten(results)).map(result => result.filepath));
    });
  }

  /**
   * Run the script defined in config 'script'
   */
  executeScript() {
    let hasErrored = false;
    let args, command, script;

    if (this.config.runtimeOptions.script && (script = this.config.script)) {
      script = script.split(' ');
      command = script.shift();
      args = script;

      print('executing script...', 1);
      debug(`execute: ${strong(this.config.script)}`, 3);

      script = spawn(command, args, { cwd: process.cwd() });

      script.stdout.on('data', data => {
        process.stdout.write(data.toString());
      });

      script.stderr.on('data', data => {
        process.stderr.write(data.toString());
        hasErrored = true;
      });

      script.on('close', code => {
        if (hasErrored) process.stderr.write(BELL);
      });
    }
  }

  /**
   * Handle cache changes
   * @param {String} filepath
   */
  onFileCacheChange(filepath: string) {
    const now = new Date();
    const builds = this.builds.filter(build => build.hasFile(filepath));
    // Determine if any changes to app server code that needs a restart
    const servers = builds.filter(build => build.isAppServer) || [];

    if (!this.building) {
      print(`\n[${now.toLocaleTimeString()}] ${chalk.yellow('changed')} ${strong(filepath)}`, 0);

      stopwatch.start('watch');

      this.run(builds, (err, filepaths) => {
        if (err != null) {
          // Don't throw
          return error(err, 2, false);
        // TODO: unnecessary, but flow
        } else if (filepaths != null) {
          if (serverfarm != null) {
            // Trigger partial refresh if only 1 css file, full reload if not
            const filepath = filepaths.length === 1 && path.extname(filepaths[0]) === '.css' ? filepaths[0] : 'foo.js';

            // Refresh browser
            if (servers.length > 0) {
              serverfarm.refresh(path.basename(filepath));
            } else {
              // Restart app server
              serverfarm.restart(err => {
                if (err != null) {
                  return void console.log(err);
                }
                // Refresh browser
                serverfarm.refresh(path.basename(filepath));
              });
            }
          }
          print(`\ndone build in ${chalk.cyan(stopwatch.stop('watch', true))}\n`, 0);
          // Run test script
          this.executeScript();
        }
      });
    }
  }
}
