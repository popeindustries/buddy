http = require('http')
Url = require('url')
fs = require('fs')
path = require('path')
EventEmitter = require('events').EventEmitter
ws = require('websocket.io')
Connection = require('./reloadconnection')

PORT = 35729

module.exports = class ReloadServer extends EventEmitter

	# Constructor
	constructor: ->
		@options =
			id: 'com.popeindustries.buddy'
			name: 'buddy-livereload'
			version: '1.0'
			port: PORT
		@port = @options.port
		@connections = {}
		@connectionId = 0
		@server = null
		@wsServer = null

	# Begin listening
	# @param {Function} fn(err)
	listen: (fn) ->
		@server = http.createServer()
		@server.on('error', (err) -> fn(err))
		@server.listen @options.port, (err) =>
			return fn(err) if err
			@server.on 'request', (request, response) =>
				request.on 'end', =>
					url = Url.parse(request.url, true)
					# Serve livereload.js file
					if url.pathname is '/livereload.js'
						fs.readFile path.join(__dirname, 'livereload.js'), 'utf8', (err, data) ->
							return fn(err) if err
							response.writeHead(200, {'Content-Length': data.length, 'Content-Type': 'text/javascript'})
							response.end(data)
					# All other requests 404
					else
						response.writeHead(404)
						response.end()
			# Create socket server
			@wsServer = ws.attach(@server)
			@wsServer.on 'connection', (socket) =>
				@_createConnection(socket)
			fn()

	# Get all active connections
	# @return {Arrray}
	activeConnections: ->
		connections = []
		for id, connection of @connections
			connections.push(connection) if connection.isActive()
		return connections

	# Close server
	close: ->
		@server.close()
		for connection of @connections
			connection.close()
		@connections = {}

	# Create connection instance
	# @param {Object} socket
	_createConnection: (socket) ->
		connection = new Connection(socket, "buddy#{++@connectionId}", @options)
		connection.on 'connected', =>
			@connections[connection.id] = connection
			@emit('connected', connection)
		connection.on 'disconnected', =>
			delete @connections[connection.id]
			@emit('disconnected', connection)
		connection.on 'command', (command) =>
			@emit('command', command)
		connection.on 'error', (err) =>
			@emit('error', err)
		return connection
