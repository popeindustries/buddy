fs = require('fs')
path = require('path')
{wait} = require('./utils')
# Node 0.8.0 api change
existsSync = fs.existsSync or path.existsSync

module.exports = class Watcher

	constructor: (@source, @ignore, fn) ->
		watcher = fs.watch @source, ->
			# fs.readdirSync