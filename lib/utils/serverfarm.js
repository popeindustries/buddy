'use strict';

var cnsl = require('./cnsl')
	, fork = require('child_process').fork
	, fs = require('fs')
	, merge = require('lodash').merge
	, path = require('path')
	, portscanner = require('portscanner')
	, ReloadServer = require('buddy-server').ReloadServer
	, series = require('async').series
	, Server = require('buddy-server').Server

	, appServer = {}
	, checkAppServerPort = false
	, debug = cnsl.debug
	, error = cnsl.error
	, isReady = false
	, print = cnsl.print
	, strong = cnsl.strong
	, server, reloadServer, appServerErrorHandler;

exports.server = server;
exports.reloadServer = reloadServer;

/**
 * Start the servers
 * @param {Boolean} serve
 * @param {Boolean} reload
 * @param {Object} options
 * @param {Function} fn(err)
 */
exports.start = function (serve, reload, options, fn) {
	series([function (done) {
		if (serve) {
			var file = options.file ? path.resolve(options.file) : ''
				, started = function (err) {
						if (err) return fn(err);
						print('started serving '
							+ strong(options.file || options.directory)
							+ ' on port: '
							+ options.port
						, 2);
						done();
					};

			// Initialize app server
			if (file && fs.existsSync(file)) {
				var env = merge({}, process.env, options.env);
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
	function (done) {
		// Initialize reload server
		if (reload) {
			reloadServer = new ReloadServer();
			reloadServer.on('error', function (err) {
				if (!~err.message.indexOf('ECONNRESET')) throw err;
			})
			reloadServer.start(function (err) {
				isReady = true;
				print('started live-reload server on port: ' + reloadServer.port , 2);
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
exports.restart = function (fn) {
	if (isReady && appServer) {
		server.removeAllListeners();
		server.kill();
		setTimeout(startAppServer.bind(module, fn), 100);
	}
};

/**
 * Stop servers
 */
exports.stop = function () {
	try {
		if (server) appServer ? server.kill() : server.close();
		if (reloadServer) reloadServer.close();
	} catch (err) { }
	server = null;
	reloadServer = null;
	isReady = false;
};

/**
 * Refresh the 'file' in browser
 * @param {String} file
 */
exports.refresh = function (file) {
	var msg;

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

		reloadServer.activeConnections().forEach(function (connection) {
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
	server.on('exit', function (code) {
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
	var opts = {
		timeout: 100
	};

	function check () {
		if (checkAppServerPort) {
			portscanner.checkPortStatus(port, opts, function (err, status) {
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