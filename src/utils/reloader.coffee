path = require('path')
fs = require('fs')
LRServer = require('livereload-server')

server = null
ready = false

onSocketMessage = (msg) ->
	console.log msg

onSocketClose = ->
	console.log 'closed'

exports.start = (options) ->
	server = new LRServer({ id: "com.example.acme", name: "Acme", version: "1.0", protocols: { monitoring: 7, saving: 1 } })

	server.on 'connected', (connection) ->
		console.log("Client connected (%s)", connection.id)

	server.on 'disconnected', (connection) ->
		console.log("Client disconnected (%s)", connection.id)

	server.on 'command', (connection, message) ->
		console.log("Received command %s: %j", message.command, message)

	server.on 'error', (err, connection) ->
		console.log("Error (%s): %s", connection.id, err.message)

	server.on 'livereload.js', (request, response) ->
		fs.readFile path.join(__dirname, 'livereload.js'), 'utf8', (err, data) ->
			err and throw err
			response.writeHead(200, {'Content-Length': data.length, 'Content-Type': 'text/javascript'})
			response.end(data)

	server.listen (err) ->
		if err
			console.error("Listening failed: %s", err.message)
			return
		console.log("Listening on port %d.", server.port)
		ready = true

exports.refresh = (files) ->
	console.log files
	# Send 'reload' message
	if ready
		msg =
			command: 'reload'
			path: files[0]
			liveCSS: true

		server.emit('command', msg)
