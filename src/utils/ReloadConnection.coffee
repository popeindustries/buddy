EventEmitter = require('events').EventEmitter
Parser = require('livereload-protocol')

TIMEOUT = 1000

module.exports = class ReloadConnection extends EventEmitter

	# Constructor
	# @param {Object} socket
	# @param {String} id
	# @param {Object} options
	constructor: (@socket, @id, options) ->
		protocols =
			monitoring: [Parser.protocols.MONITORING_7]
			conncheck: [Parser.protocols.CONN_CHECK_1]
			saving: [Parser.protocols.SAVING_1]
		@parser = new Parser 'server', protocols

		# Register for socket events
		@socket.on 'message', (data) =>
			@parser.received(data)
		@socket.on 'close', =>
			clearTimeout(timeoutID) if timeoutID
			@emit('disconnected')
		@socket.on 'error', (err) =>
			@socket.close()
			@emit('error', err)

		# Register for parser events
		@parser.on 'command', (command) =>
			if command.command is 'ping'
				@send {command: 'pong', token: command.token}
			else
				@emit('command', command)
		@parser.on 'connected', =>
			clearTimeout(timeoutID) if timeoutID
			@send(@parser.hello(options))
			@emit('connected')

		# Start handshake timeout
		timeoutID = setTimeout =>
			timeoutID = null
			@close()
		, TIMEOUT

	# Get active state
	# @return {Boolean}
	isActive: ->
		@parser.negotiatedProtocols?.monitoring >= 7

	# Send 'msg' to client
	# @param {Object} msg
	send: (msg) ->
		@parser.sending(msg)
		@socket.send(JSON.stringify(msg))

	# Close connection
	close: ->
		@socket.close()