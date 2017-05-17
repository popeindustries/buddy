'use strict';

const { debug, print, strong } = require('./cnsl');
const { fork } = require('child_process');
const { isArray, isInvalid, isNullOrUndefined, isUndefined } = require('./is');
const chalk = require('chalk');
const merge = require('lodash/merge');
const path = require('path');
const portscanner = require('portscanner');
const series = require('async/series');

let appServer = {};
let checkingAppServerPort = false;
let isReloading = false;
let server, reloadServer;

module.exports = {
  /**
   * Start the servers
   * @param {Boolean} serve
   * @param {Boolean} reload
   * @param {Object} options
   *  - {String} buddyServerPath
   *  - {String} directory
   *  - {Object} env
   *  - {Array} extraDirectories
   *  - {Array} flags
   *  - {String} file
   *  - {Object} headers
   *  - {Number} port
   * @param {Function} fn(err)
   */
  start(serve, reload, options, fn) {
    const { ReloadServerFactory, ServerFactory } = require(options.buddyServerPath);
    const tasks = [];

    if (reload) {
      tasks.push(done => {
        reloadServer = ReloadServerFactory();
        reloadServer.on('error', err => {
          if (!err.message.includes('ECONNRESET')) {
            throw err;
          }
        });
        print(`live-reloading on port: ${reloadServer.port}`, 0);
        reloadServer.start(err => {
          isReloading = true;
          done();
        });
      });
    }

    if (serve) {
      const filepath = path.relative(process.cwd(), options.file || options.directory) || path.dirname(process.cwd());

      tasks.push(done => {
        const file = options.file ? path.resolve(options.file) : '';
        const started = err => {
          if (!isUndefined(err)) {
            return fn(err);
          }
          done();
        };

        print(`serving ${strong(filepath)} at ${chalk.underline('http://localhost:' + options.port)}\n`, 0);

        // Initialize app server
        if (!isInvalid(file)) {
          const env = merge({}, process.env, options.env);

          env.PORT = options.port;
          appServer = {
            file,
            port: options.port,
            options: {
              cwd: process.cwd(),
              env,
              execArgv: options.flags ? (isArray(options.flags) ? options.flags : [options.flags]) : []
            }
          };
          startAppServer(started);

          // Initialize static file server
        } else {
          server = ServerFactory(options.directory, options.port, options.headers, options.extraDirectories);
          server.start(started);
        }
      });
    }

    series(tasks, fn);
  },

  /**
   * Restart app server
   * @param {Function} fn
   */
  restart(fn) {
    if (!isNullOrUndefined(server)) {
      checkingAppServerPort = false;
      server.removeAllListeners();
      server.on('close', () => {
        server = null;
        startAppServer(fn);
      });
      server.kill('SIGKILL');
    } else {
      startAppServer(fn);
    }
  },

  /**
   * Refresh the 'file' in browser
   * @param {String} file
   */
  refresh(file) {
    let msg;

    if (isReloading && !isNullOrUndefined(reloadServer)) {
      msg = {
        command: 'reload',
        path: file,
        liveCSS: true
      };
      debug(`sending ${strong('reload')} command to live-reload clients`, 4);

      reloadServer.activeConnections().forEach(connection => {
        connection.send(msg);
      });
    }
  },

  /**
   * Stop servers
   */
  stop() {
    try {
      if (!isNullOrUndefined(server)) {
        server[appServer ? 'kill' : 'close']();
      }
      if (!isNullOrUndefined(reloadServer)) {
        reloadServer.close();
      }
    } finally {
      server = null;
      reloadServer = null;
      isReloading = false;
    }
  }
};

/**
 * Start app server
 * @param {Function} fn(err)
 */
function startAppServer(fn) {
  if (!checkingAppServerPort) {
    server = fork(appServer.file, [], appServer.options);
    server.on('exit', code => {
      checkingAppServerPort = false;
      server.removeAllListeners();
      server = null;
      fn(Error('failed to start server'));
    });

    checkingAppServerPort = true;
    waitForPortOpen(appServer.port, fn);
  }
}

/**
 * Wait for app server connection on 'port'
 * @param {Number} port
 * @param {Function} fn(err)
 */
function waitForPortOpen(port, fn) {
  function check() {
    if (checkingAppServerPort) {
      portscanner.checkPortStatus(port, '127.0.0.1', (err, status) => {
        if (isInvalid(status) || status !== 'open') {
          setTimeout(check, 20);
        } else {
          checkingAppServerPort = false;
          fn();
        }
      });
    }
  }

  check();
}
