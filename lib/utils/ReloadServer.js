var http = require('http')
	, util = require("util")
	, Url = require('url')
	, fs = require('fs')
	, path = require('path')
	, EventEmitter = require('events').EventEmitter
	, ws = require('websocket.io')
	, Connection = require('./ReloadConnection')
	, PORT = 35729;

module.exports = ReloadServer;

function ReloadServer() {
	EventEmitter.call(this);

	this.options = {
		id: 'com.popeindustries.buddy',
		name: 'buddy-livereload',
		version: '1.0',
		port: PORT
	};
	this.port = this.options.port;
	this.connections = {};
	this.connectionId = 0;
	this.server = null;
	this.wsServer = null;
}

// Inherit
util.inherits(ReloadServer, EventEmitter);

/**
 * Begin listening
 * @param {Function} fn(err)
 */
ReloadServer.prototype.listen = function(fn) {
	var self = this;
	this.server = http.createServer();
	this.server.on('error', function(err) {
		fn(err);
	});
	this.server.listen(this.options.port, function(err) {
		if (err) return fn(err);
		self.server.on('request', function(request, response) {
			request.on('end', function() {
				var url = Url.parse(request.url, true);
				// Serve livereload.js file
				if (url.pathname == '/livereload.js') {
					fs.readFile(path.join(__dirname, 'livereload.js'), 'utf8', function(err, data) {
						if (err) return fn(err);
						response.writeHead(200, {
							'Content-Length': data.length,
							'Content-Type': 'text/javascript'
						});
						response.end(data);
					});
				// All other requests 404
				} else {
					response.writeHead(404);
					response.end();
				}
			});
		});
		// Create socket server
		self.wsServer = ws.attach(self.server);
		self.wsServer.on('connection', function(socket) {
			self._createConnection(socket);
		});
		fn();
	});
};

/**
 * Get all active connections
 * @return {Arrray}
 */
ReloadServer.prototype.activeConnections = function() {
	var connections = []
		, connection;
	for (var id in this.connections) {
		connection = this.connections[id];
		if (connection.isActive()) connections.push(connection);
	}
	return connections;
};

/**
 * Close server
 */
ReloadServer.prototype.close = function() {
	this.server.close();
	for (var connection in this.connections) {
		connection.close();
	}
	this.connections = {};
};

/**
 * Create connection instance
 * @param {Object} socket
 */
ReloadServer.prototype._createConnection = function(socket) {
	var connection = new Connection(socket, "buddy" + (++this.connectionId), this.options);
		self = this;
	connection.on('connected', function() {
		self.connections[connection.id] = connection;
		self.emit('connected', connection);
	});
	connection.on('disconnected', function() {
		delete self.connections[connection.id];
		self.emit('disconnected', connection);
	});
	connection.on('command', function(command) {
		self.emit('command', command);
	});
	connection.on('error', function(err) {
		self.emit('error', err);
	});
	return connection;
};
