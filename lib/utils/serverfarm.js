var ReloadServer = require('buddy-server').ReloadServer
	, Server = require('buddy-server').Server
	, fs = require('fs')
	, path = require('path')
	, fork = require('child_process').fork
	, portscanner = require('portscanner')
	, cnsl = require('./cnsl')
	, debug = cnsl.debug
	, print = cnsl.print
	, strong = cnsl.strong
	, error = cnsl.error
	, isReady = false
	, appServer = {}
	, checkAppServerPort = false
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
			var env = options.env || {};
			env.PORT = options.port;
			env.ROOT = path.resolve(options.directory);
			appServer = {
				file: file,
				options: {
					cwd: process.cwd(),
					env: env
				}
			};
			startAppServer(cb);
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
 * Restart app server (thunk)
 * @returns {Function}
 */
exports.restart = function () {
	return function (fn) {
		if (isReady && appServer) {
			server.removeAllListeners();
			server.kill();
			startAppServer(fn);
		}
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

/**
 * Start app server
 * @param {Function} fn
 */
function startAppServer (fn) {
	server = fork(appServer.file, [], appServer.options);
	server.on('exit', function (code) {
		checkAppServerPort = false;
		error('failed to start server', 2, false);
	});
	onAppServerConnected(fn);
}

/**
 * Wait for app server connection
 * @param {Function} fn
 */
function onAppServerConnected (fn) {
	var check = function () {
		if (checkAppServerPort) {
			portscanner.checkPortStatus(3000, {timeout: 100}, function (err, status) {
				if (status == 'open') {
					checkAppServerPort = false;
					return fn();
				}
				setTimeout(check, 100);
			});
		}
	};
	checkAppServerPort = true;
	check();
}