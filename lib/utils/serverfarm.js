'use strict';

const { debug, print, strong } = require('./cnsl');
const { fork } = require('child_process');
const callable = require('./callable');
const fs = require('fs');
const merge = require('lodash/merge');
const path = require('path');
const portscanner = require('portscanner');
const series = require('async/series');

let appServer = {};
let checkAppServerPort = false;
let isReady = false;
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
   *  - {Array} flags
   *  - {String} file
   *  - {Number} port
   * @param {Function} fn(err)
   */
  start (serve, reload, options, fn) {
    const { ReloadServerFactory, ServerFactory } = require(options.buddyServerPath);
    let tasks = [];

    if (serve) {
      tasks.push((done) => {
        const file = options.file ? path.resolve(options.file) : '';
        const started = (err) => {
          if (err) return fn(err);
          print(`started serving ${strong(options.file || options.directory)} at http://localhost:${options.port}`, 1);
          done();
        };

        // Initialize app server
        if (file && fs.existsSync(file)) {
          const env = merge({}, process.env, options.env);

          env.PORT = options.port;
          env.ROOT = path.resolve(options.directory);
          appServer = {
            file,
            port: options.port,
            options: {
              cwd: process.cwd(),
              env,
              execArgv: options.flags
                ? Array.isArray(options.flags)
                  ? options.flags
                  : [options.flags]
                : []
            }
          };
          startAppServer(started);

        // Initialize static file server
        } else {
          server = ServerFactory(options.directory, options.port);
          server.start(started);
        }
      });
    }

    if (reload) {
      tasks.push((done) => {
        reloadServer = ReloadServerFactory();
        reloadServer.on('error', (err) => {
          if (!err.message.includes('ECONNRESET')) throw err;
        });
        reloadServer.start((err) => {
          if (err) { /* ignore */}
          isReady = true;
          print(`started live-reload server on port: ${reloadServer.port}`, 1);
          done();
        });
      });
    }

    series(tasks, fn);
  },

  /**
   * Restart app server
   * @param {Function} fn
   */
  restart (fn) {
    if (isReady && appServer) {
      server.removeAllListeners();
      server.kill();
      setTimeout(callable(startAppServer, null, fn), 100);
    }
  },

  /**
   * Refresh the 'file' in browser
   * @param {String} file
   */
  refresh (file) {
    let msg;

    if (isReady && reloadServer) {
      msg = {
        command: 'reload',
        path: file,
        liveCSS: true
      };
      debug(`sending ${strong('reload')} command to live-reload clients`, 4);

      reloadServer.activeConnections().forEach((connection) => {
        connection.send(msg);
      });
    }
  },

  /**
   * Stop servers
   */
  stop () {
    try {
      if (server) server[appServer ? 'kill' : 'close']();
      if (reloadServer) reloadServer.close();
    } catch (err) { /* ignore */ }
    server = null;
    reloadServer = null;
    isReady = false;
  }
};

/**
 * Start app server
 * @param {Function} fn(err)
 */
function startAppServer (fn) {
  server = fork(appServer.file, [], appServer.options);
  server.on('exit', (code) => {
    checkAppServerPort = false;
    fn(Error('failed to start server'));
  });

  checkAppServerPort = true;
  waitForPortOpen(appServer.port, fn);
}

/**
 * Wait for app server connection on 'port'
 * @param {Number} port
 * @param {Function} fn(err)
 */
function waitForPortOpen (port, fn) {
  const options = {
    timeout: 20
  };

  function check () {
    if (checkAppServerPort) {
      portscanner.checkPortStatus(port, options, (err, status) => {
        if (err) { /* ignore */}
        if (!status || status != 'open') {
          setTimeout(check, 20);
        } else {
          checkAppServerPort = false;
          fn();
        }
      });
    }
  }

  check();
}