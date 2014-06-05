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
	, server, reloadServer, appServerErrorHandler
	, checkPortStatus = function (port, options)	{
			return function (fn) {
				portscanner.checkPortStatus(port, options, fn);
			}
		};

exports.server = server;
exports.reloadServer = reloadServer;

/**
 * Start the servers
 * @param {Boolean} serve
 * @param {Boolean} reload
 * @param {Object} options
 */
exports.start = function* (serve, reload, options) {
	if (serve) {
		var file = options.file ? path.resolve(options.file) : '';

		// Initialize app server
		if (file && fs.existsSync(file)) {
			var env = options.env || {};
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
			yield* startAppServer();

		// Initialize static file server
		} else {
			server = new Server(options.directory, options.port);
			yield* server.start();
		}

		print("started serving "
			+ strong(options.file || options.directory)
			+ " on port: "
			+ options.port
		, 2);
	}

	// Initialize reload server
	if (reload) {
		reloadServer = new ReloadServer();
		yield* reloadServer.start();
		isReady = true;
		print("started live-reload server on port: " + reloadServer.port , 2);
	}

	return;
};

/**
 * Restart app server
 */
exports.restart = function* () {
	if (isReady && appServer) {
		server.removeAllListeners();
		server.kill();
		yield sleep(100);
		yield* startAppServer();
	}
	return
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
 */
function* startAppServer () {
	server = fork(appServer.file, [], appServer.options);
	server.on('exit', function (code) {
		checkAppServerPort = false;
		error('failed to start server', 2, false);
	});
	checkAppServerPort = true;
	yield* waitForPortOpen(appServer.port);
}

/**
 * Wait for app server connection on 'port'
 * @param {Number} port
 */
function* waitForPortOpen (port) {
	var check = function* () {
		if (checkAppServerPort) {
			try {
				var status = yield checkPortStatus(port, {timeout: 100});
			} catch (err) {}
			if (!status || status != 'open') {
				yield sleep(100);
				yield check();
			}
		}
	}
	yield check();
	checkAppServerPort = false;
}

/**
 * Sleep for 'ms' milliseconds thunk
 * @param {Number} ms
 */
function sleep (ms) {
	return function (fn) {
		setTimeout(fn, ms);
	}
}