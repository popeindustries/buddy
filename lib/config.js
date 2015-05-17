'use strict';

var alias = require('identify-resource').alias
	, clone = require('lodash/lang/clone')
	, cnsl = require('./utils/cnsl')
	, extend = require('lodash/object/extend')
	, fs = require('fs')
	, glob = require('glob').sync
	, path = require('path')
	, recurFs = require('recur-fs')
	, unique = require('lodash/array/unique')

	, DEFAULT_FILE_EXTENSIONS = {
			js: ['js', 'json'],
			css: ['css'],
			html: ['html']
		}
	, DEFAULT_JS = 'buddy.js'
	, DEFAULT_JSON = 'buddy.json'
	, DEFAULT_OPTIONS = {
			compress: false,
			lint: false,
			script: false,
			lazy: false,
			reload: false,
			serve: false,
			watch: false,
			deploy: false,
			verbose: false,
			targets: ['js','css','html']
		}
	, DEFAULT_PACKAGE_JSON = 'package.json'
	, DEFAULT_SERVER = {
			directory: '.',
			port: 8080
		}
	, DEFAULT_SOURCES = {
			js: ['.'],
			css: ['.'],
			html: ['.']
		}
	, RE_GLOB = /[\*\[\{]/
	, RE_UNIQUE = /{(?:hash|date)}/

	, debug = cnsl.debug
	, error = cnsl.error
	, hunt = recurFs.hunt.sync
	, indir = recurFs.indir
	, strong = cnsl.strong
	, warn = cnsl.warn;

/**
 * Locate the configuration file
 * Walks the directory tree if no file/directory specified
 * @param {String} [url]
 * @returns {String}
 */
exports.locate = function (url) {
	var configpath;

	function check (dir) {
		// Support js, json, and package.json
		var urljs = path.join(dir, DEFAULT_JS)
			, urljson = path.join(dir, DEFAULT_JSON)
			, urlpkgjson = path.join(dir, DEFAULT_PACKAGE_JSON)
			, url;

		if (fs.existsSync(url = urljs)
			|| fs.existsSync(url = urljson)
			|| fs.existsSync(url = urlpkgjson)) {
				return url;
		} else {
			return '';
		}
	}

	if (url) {
		configpath = path.resolve(url);
		try {
			// Try default file name if passed directory
			if (!path.extname(configpath).length || fs.statSync(configpath).isDirectory()) {
				configpath = check(configpath);
				if (!configpath) throw 'no default found';
			}
		} catch (err) {
			throw new Error(strong('buddy') + ' config not found in ' + strong(path.dirname(url)));
		}

	// No url specified
	} else {
		try {
			// Find the first instance of a DEFAULT file based on the current working directory
			configpath = hunt(process.cwd(), function (resource, stat) {
				if (stat.isFile()) {
					var basename = path.basename(resource);
					return (basename == DEFAULT_PACKAGE_JSON || basename == DEFAULT_JS || basename == DEFAULT_JSON);
				}
			}, true);
		} catch (err) {
			if (!configpath) throw new Error(strong('buddy') + ' config not found');
		}
	}

	return configpath;
};
