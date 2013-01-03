var path = require('path')
	, fs = require('fs');

module.exports = {
	name: 'amd',
	category: 'js',
	type: 'module',

	/**
	 * Retrieve a module's id based on it's 'qualifiedFilename'
	 * @param {String} qualifiedFilename
	 * @return {String}
	 */
	getModuleID: function(qualifiedFilename) {
		return '';
	},

	/**
	 * Retrieve all module references in file 'content'
	 * Convert all references relative to 'id'
	 * @param {String} content
	 * @param {String} id
	 * @return {Array}
	 */
	getModuleDependencies: function(contents, id) {
		var deps;
		deps = [];
		return deps;
	},

	/**
	 * Wrap 'content' in module definition if not already wrapped
	 * @param {String} content
	 * @param {String} id
	 * @param {Boolean} lazy
	 * @return {String}
	 */
	wrapModuleContents: function(contents, id, lazy) {
		return contents;
	},

	/**
	 * Concatenate file and dependency content
	 * @param {File} file
	 * @return String
	 */
	concat: function(file) {
		return '';
	}
};
