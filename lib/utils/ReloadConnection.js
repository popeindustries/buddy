var EventEmitter = require('events').EventEmitter
	, util = require("util")
	, Parser = require('livereload-protocol')
	, TIMEOUT = 1000;

module.exports = ReloadConnection;

/**
 * Constructor
 * @param {Object} socket
 * @param {String} id
 * @param {Object} options
 */
function ReloadConnection(socket, id, options) {
	EventEmitter.call(this);
	var self = this
		, timeoutID = null
		, protocols = {
				monitoring: [Parser.protocols.MONITORING_7],
				conncheck: [Parser.protocols.CONN_CHECK_1],
				saving: [Parser.protocols.SAVING_1]
			};
	this.socket = socket;
	this.id = id;
	this.parser = new Parser('server', protocols);

	// Register for socket events
	this.socket.on('message', function(data) {
		self.parser.received(data);
	});
	this.socket.on('close', function() {
		if (timeoutID) clearTimeout(timeoutID);
		self.emit('disconnected');
	});
	this.socket.on('error', function(err) {
		self.socket.close();
		self.emit('error', err);
	});

	// Register for parser events
	this.parser.on('command', function(command) {
		if (command.command === 'ping') {
			self.send({command: 'pong', token: command.token});
		} else {
			self.emit('command', command);
		}
	});
	this.parser.on('connected', function() {
		if (timeoutID) clearTimeout(timeoutID);
		self.send(self.parser.hello(options));
		self.emit('connected');
	});

	// Start handshake timeout
	timeoutID = setTimeout(function() {
		timeoutID = null;
		self.close();
	}, TIMEOUT);
}

// Inherit
util.inherits(ReloadConnection, EventEmitter);

/**
 * Get active state
 * @return {Boolean}
 */
ReloadConnection.prototype.isActive = function() {
	if (this.parser.negotiatedProtocols != null) {
		return this.parser.negotiatedProtocols.monitoring >= 7;
	}
};

/**
 * Send 'msg' to client
 * @param {Object} msg
 */
ReloadConnection.prototype.send = function(msg) {
	this.parser.sending(msg);
	this.socket.send(JSON.stringify(msg));
};

/**
 * Close connection
 */
ReloadConnection.prototype.close = function() {
	this.socket.close();
};