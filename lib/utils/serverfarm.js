var ReloadServer = require('buddy-server').ReloadServer
	, Server = require('buddy-server').Server
	, fs = require('fs')
	, path = require('path')
	, fork = require('child_process').fork
	, cnsl = require('./cnsl')
	, debug = cnsl.debug
	, print = cnsl.print
	, strong = cnsl.strong
	, isReady = false
	, appServer = {}
	, server, reloadServer;

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
	if (serve) {
		var file = options.file ? path.resolve(options.file) : ''
			, cb = function (err) {
					if (err) return fn(err);
					print("started serving "
						+ strong(options.file || options.directory)
						+ " on port: "
						+ options.port
					, 2);
					if (!reload) fn();
				};
		// Initialize app server
		if (file && fs.existsSync(file)) {
			appServer = {
				file: file,
				options: {
					cwd: process.cwd(),
					env: {
						PORT: options.port,
						ROOT: path.resolve(options.directory)
					}
				}
			};
			server = fork(appServer.file, [], appServer.options);
			cb();
		// Initialize static file server
		} else {
			server = new Server(options.directory, options.port);
			server.start(cb);
		}
	}
	// Initialize reload server
	if (reload) {
		reloadServer = new ReloadServer();
		reloadServer.on('error', fn);
		reloadServer.start(function (err) {
			if (err) return fn(err);
			print("started live-reload server on port: "
				+ reloadServer.port
			, 2);
			isReady = true;
			fn();
		});
	}
};

/**
 * Restart app server
 * @param {Function} fn()
 */
exports.restart = function (fn) {
	if (isReady && appServer) {
		var cb = function () {
			server = fork(appServer.file, [], appServer.options);
			// Delay for server up
			setTimeout(fn, 500);
		}
		server.kill();
		// If server has errored, restart, otherwise wait until closed
		(server.exitCode === 1) ? cb() : server.once('close', cb);
	}
};

/**
 * Stop servers
 */
exports.stop = function () {
	if (server) appServer ? server.kill() : server.close();
	if (reloadServer) reloadServer.close();
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
		debug("sending "
			+ (strong('reload'))
			+ " command to live-reload clients"
		, 4);
		reloadServer.activeConnections().forEach(function (connection) {
			connection.send(msg);
		});
	}
};
