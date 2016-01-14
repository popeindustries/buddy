'use strict';

const cnsl = require('./cnsl')
  , fork = require('child_process').fork
  , fs = require('fs')
  , merge = require('lodash/merge')
  , path = require('path')
  , portscanner = require('portscanner')
  , ReloadServer = require('buddy-server').ReloadServer
  , series = require('async').series
  , Server = require('buddy-server').Server
  , debug = cnsl.debug
  , print = cnsl.print
  , strong = cnsl.strong;

let appServer = {}
  , checkAppServerPort = false
  , isReady = false
  , server, reloadServer;

/**
 * Start the servers
 * @param {Boolean} serve
 * @param {Boolean} reload
 * @param {Object} options
 * @param {Function} fn(err)
 */
exports.start = function start (serve, reload, options, fn) {
  series([(done) => {
    if (serve) {
      const file = options.file ? path.resolve(options.file) : ''
        , started = (err) => {
            if (err) return fn(err);
            print('started serving '
              + strong(options.file || options.directory)
              + ' on port: '
              + options.port
            , 1);
            done();
          };

      // Initialize app server
      if (file && fs.existsSync(file)) {
        const env = merge({}, process.env, options.env);

        env.PORT = options.port;
        env.ROOT = path.resolve(options.directory);
        appServer = {
          file: file,
          port: options.port,
          options: {
            cwd: process.cwd(),
            env: env
          }
        };
        startAppServer(started);

      // Initialize static file server
      } else {
        server = new Server(options.directory, options.port);
        server.start(started);
      }
    } else {
      done();
    }
  },
  (done) => {
    // Initialize reload server
    if (reload) {
      reloadServer = new ReloadServer();
      reloadServer.on('error', function (err) {
        if (!~err.message.indexOf('ECONNRESET')) throw err;
      });
      reloadServer.start(function (err) {
        if (err) { /* ignore */}
        isReady = true;
        print('started live-reload server on port: ' + reloadServer.port, 1);
        done();
      });
    } else {
      done();
    }
  }], fn);
};

/**
 * Restart app server
 * @param {Function} fn
 */
exports.restart = function restart (fn) {
  if (isReady && appServer) {
    server.removeAllListeners();
    server.kill();
    setTimeout(startAppServer.bind(module, fn), 100);
  }
};

/**
 * Stop servers
 */
exports.stop = function stop () {
  try {
    if (server) server[appServer ? 'kill' : 'close']();
    if (reloadServer) reloadServer.close();
  } catch (err) { /* ignore */ }
  server = null;
  reloadServer = null;
  isReady = false;
};

/**
 * Refresh the 'file' in browser
 * @param {String} file
 */
exports.refresh = function refresh (file) {
  let msg;

  if (isReady && reloadServer) {
    msg = {
      command: 'reload',
      path: file,
      liveCSS: true
    };
    debug('sending '
      + strong('reload')
      + ' command to live-reload clients'
    , 4);

    reloadServer.activeConnections().forEach((connection) => {
      connection.send(msg);
    });
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
    fn(new Error('failed to start server'));
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
    timeout: 100
  };

  function check () {
    if (checkAppServerPort) {
      portscanner.checkPortStatus(port, options, (err, status) => {
        if (err) { /* ignore */}
        if (!status || status != 'open') {
          setTimeout(check, 100);
        } else {
          checkAppServerPort = false;
          fn();
        }
      });
    }
  }

  check();
}