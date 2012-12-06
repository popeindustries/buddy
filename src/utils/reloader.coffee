path = require('path')
fs = require('fs')
ReloadServer = require('./reloadserver')
{debug, strong, print} = require('./notify')

server = null
ready = false

# Start the reload server
exports.start = ->
	unless server
		server = new ReloadServer()

		server.on 'connected', (connection) ->
			print("live-reload client connected: #{connection.id}", 3)

		server.on 'disconnected', (connection) ->
			print("live-reload client disconnected: #{connection.id}", 3)

		server.on 'command', (message) ->
			debug("received live-reload command '#{message.command}': #{message.url}", 4)

		server.on 'error', (err) ->
			fn(err)

		server.listen (err) ->
			# return fn(err) if err
			unless err
				print("started live-reload server on port: #{server.port}", 2)
				ready = true

# Stop server
exports.stop = ->
	if server
		server.close()
		server = null
		ready = false

# Refresh the 'file' in browser
# @param {String} file
exports.refresh = (file) ->
	if ready
		msg =
			command: 'reload'
			path: file
			liveCSS: true
		debug("sending #{strong('reload')} command to live-reload clients", 4)
		server.activeConnections().forEach (connection) ->
			connection.send(msg)
