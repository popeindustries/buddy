var path = require('path')
	, fs = require('fs')
	, ReloadServer = require('./ReloadServer')
	, notify = require('./notify')
	, debug = notify.debug
	, strong = notify.strong
	, print = notify.print
	, ready = false
	, server;

/**
 * Start the reload server
 * @param {Function} fn(err)
 */
exports.start = function(fn) {
	if (!server) {
		server = new ReloadServer();
		server.on('connected', function(connection) {
			print("live-reload client connected: " + connection.id, 3);
		});
		server.on('disconnected', function(connection) {
			print("live-reload client disconnected: " + connection.id, 3);
		});
		server.on('command', function(message) {
			debug("received live-reload command '" + message.command + "': " + message.url, 4);
		});
		server.on('error', function(err) {
			fn(err);
		});

		server.listen(function(err) {
			if (!err) {
				print("started live-reload server on port: " + server.port, 2);
				ready = true;
			}
		});
	}
};

/**
 * Stop server
 */
exports.stop = function() {
	if (server) {
		server.close();
		server = null;
		ready = false;
	}
};

/**
 * Refresh the 'file' in browser
 * @param {String} file
 */
exports.refresh = function(file) {
	var msg;
	if (ready) {
		msg = {
			command: 'reload',
			path: file,
			liveCSS: true
		};
		debug("sending " + (strong('reload')) + " command to live-reload clients", 4);
		server.activeConnections().forEach(function(connection) {
			connection.send(msg);
		});
	}
};
