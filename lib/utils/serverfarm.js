var ReloadServer = require('buddy-server').ReloadServer
	, Server = require('buddy-server').Server
	, cnsl = require('./cnsl')
	, debug = cnsl.debug
	, print = cnsl.print
	, strong = cnsl.strong
	, ready = false
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
	// Initialize static file server
	if (serve) {
		server = new Server(options.directory, options.port);
		server.start(function (err) {
			if (err) return fn(err);
			print("started serving "
				+ strong(server.directory)
				+ " on port: "
				+ server.port
			, 2);
			if (!reload) fn();
		});
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
			ready = true;
			fn();
		});
	}
};

/**
 * Stop servers
 */
exports.stop = function () {
	if (server) server.close();
	if (reloadServer) reloadServer.close();
	server = null;
	reloadServer = null;
	ready = false;
};

/**
 * Refresh the 'file' in browser
 * @param {String} file
 */
exports.refresh = function (file) {
	var msg;
	if (ready && reloadServer) {
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
