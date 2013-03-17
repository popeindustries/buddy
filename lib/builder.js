var fs = require('fs')
	, path = require('path')
	, exec = require('child_process').exec
	, async = require('async')
	, configuration = require('./core/configuration')
	, filelog = require('./utils/filelog')
	, object = require('./utils/object')
	, targetFactory = require('./core/target')
	, dependencies = require('buddy-dependencies')
	, serverfarm = require('./utils/serverfarm')
	, rm = require('recur-fs').rm
	, term = require('buddy-term')
	, debug = term.debug
	, warn = term.warn
	, error = term.error
	, print = term.print
	, colour = term.colour
	, strong = term.strong;

var JS = 'js'
	, CSS = 'css'
	, HTML = 'html';

module.exports = Builder;

/**
 * Constructor
 */
function Builder() {
	this.initialized = false;
	this.config = null;
	this.targets = [];
}

Builder.prototype.build = function(configpath, options, fn) {
	this._initialize(configpath, options, function(err) {
		if (err) error(err, 2);
		this._initializeTargets(this.config.build.targets);
		if (this.targets.length) {
			// Build targets.
		}
	});
};

Builder.prototype._initialize = function(configpath, options, fn) {
	var self = this;
	term.verbose = options.verbose;
	term.start();
	if (!this.initialized) {
		// Load configuration file
		configuration.load(configpath, options, function(err, data) {
			if (err) return fn(err);
			self.config = data;
			print("loaded config " + (strong(data.url)), 2);
			// Load filelog
			filelog.load();
			fn();
		});
	} else {
		fn();
	}
};

Builder.prototype._initializeTargets = function(targets) {
	var self = this;
	var init = function(targets, parent) {
		var instance;
		targets.forEach(function(target) {
			instance = targetFactory(target);
			instance.parent = parent;
			instance.hasParent = !!parent;
			// Traverse
			if (instance.hasChildren) init(instance.targets, instance);
			self.targets.push(instance);
		});
	};

	init(targets);
};

Builder.prototype._buildTargets = function() {

};