path = require('path')
fs = require('fs')
LRServer = require('livereload-server')
{debug, strong} = require('./notify')

server = null
ready = false

onSocketMessage = (msg) ->
	console.log msg

onSocketClose = ->
	console.log 'closed'

exports.start = (id, name, version, fn) ->
	server = new LRServer({id, name, version, protocols: {monitoring: 7, saving: 1}})

	server.on 'connected', (connection) ->
		debug("live-reload client connected: #{connection.id}", 4)

	server.on 'disconnected', (connection) ->
		debug("live-reload client disconnected: #{connection.id}", 4)

	server.on 'command', (connection, message) ->
		debug("received live-reload command '#{message.command}': #{message.url}", 4)

	server.on 'error', (err, connection) ->
		fn(err)

	server.on 'livereload.js', (request, response) ->
		fs.readFile path.join(__dirname, 'livereload.js'), 'utf8', (err, data) ->
			return fn(err) if err
			response.writeHead(200, {'Content-Length': data.length, 'Content-Type': 'text/javascript'})
			response.end(data)

	server.on 'httprequest', (url, request, response) ->
		response.writeHead(404)
		response.end()

	server.listen (err) ->
		# return fn(err) if err
		unless err
			debug("started live-reload server on port: #{server.port}", 3)
			ready = true

exports.refresh = () ->
	console.log files
	# Send 'reload' message
	# if ready
	# 	msg =
	# 		command: 'reload'
	# 		path: files[0]
	# 		liveCSS: true

	# 	server.emit('command', msg)
