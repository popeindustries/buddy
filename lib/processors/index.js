var path = require('path')
	, existsSync = require('recur-fs').existsSync
	, term = require('buddy-term')
	, debug = term.debug
	, strong = term.strong;

var DEFAULTS = {
		js: {
			compilers: ['./compilers/coffeescript', './compilers/typescript', './compilers/livescript'],
			compressor: './compressor/uglifyjs',
			linter: './linter/jshint',
			module: './module/node'
		},
		css: {
			compilers: ['./compilers/less', './compilers/stylus'],
			compressor: './compressor/cleancss',
			linter: './linter/csslint',
			module: './module/css'
		},
		html: {
			compilers: ['./compilers/jade-html'],
			compressor: '',
			linter: '',
			module: ''
		}
	}
	, defaults = null;

exports.installed = null;

/**
 * Load all processor modules, overriding defaults if specified in 'options'
 * @param {Object} options
 * @param {Function} fn(err)
 */
exports.load = function(options, fn) {
	debug('PROCESSORS', 1);
	// Create a copy of DEFAULTS
	defaults = JSON.parse(JSON.stringify(DEFAULTS));
	// Override if we have options
	options && overrideDefaults(options);
	loadModules(function(err, processors) {
		if (err) return fn(err);
		fn(null, exports.installed);
	});
};

/**
 * Resolve processor path
 * Handles overrides of defaults specified in configuration
 * @param {String} processor
 * @param {String} type
 */
function resolvePath(processor, type) {
	// Try version specified in configuration
	var processorPath = path.resolve(processor);
	// Fallback to default version
	if (!existsSync(processorPath + '.js')) {
		processorPath = path.resolve(__dirname, type, processor);
	}
	return processorPath;
}

/**
 * Override processor defaults with those specified in 'options'
 * @param {Object} options
 */
function overrideDefaults(options) {
	debug('overriding defaults', 2);
	for (var category in options) {
		for (var type in options[category]) {
			var processor = options[category][type];
			if (Array.isArray(defaults[category][type])) {
				// Handle arrays of plugins for 'compilers'
				if (!Array.isArray(processor)) processor = [processor];
				processor.forEach(function(plug) {
					debug("override " + category + "/" + type + " with: " + (strong(plug)), 3);
					defaults[category][type].push(resolvePath(plug, type));
				});
			} else {
				debug("override " + category + "/" + type + " with: " + (strong(processor)), 3);
				defaults[category][type] = resolvePath(processor, type);
			}
		}
	}
}

/**
 * Load processor modules
 * @param {Function} fn(err)
 */
function loadModules(fn) {
	var installed = {};
	for (var category in defaults) {
		// Create category hash
		if (installed[category] == null) installed[category] = {};
		for (var type in defaults[category]) {
			var processor = defaults[category][type];
			// Handle arrays of plugins for 'compilers'
			if (Array.isArray(processor)) {
				if (installed[category][type] == null) installed[category][type] = [];
				for (var i = 0, n = processor.length; i < n; ++i) {
					var proc = processor[i];
					try {
						debug("load " + category + "/" + type + ":" + i + " => " + (strong(proc)), 2);
						installed[category][type][i] = require(proc);
					} catch (err) {
						return fn("failed loading processor " + (strong(proc)));
					}
				}
			} else {
				if (installed[category][type] == null) installed[category][type] = {};
				try {
					// Handle undefined processors
					if (processor) {
						debug("load " + category + "/" + type + " => " + (strong(processor)), 2);
						installed[category][type] = require(processor);
					} else {
						debug("undefined " + category + "/" + type, 2);
						installed[category][type] = null;
					}
				} catch (err) {
					return fn("failed loading processor " + (strong(processor)));
				}
			}
		}
	}
	exports.installed = installed;
	return fn();
}
