'use strict';

var mkdir = require('recur-fs').mkdir.sync
	, writeFile = require('fs').writeFileSync;

/**
 * Write 'content's to disk
 * @param {String} filepath
 * @param {String} content
 * @returns {String}
 */
module.exports = function (filepath, content) {
  console.log(typeof content, Buffer.isBuffer(content))
	mkdir(filepath);
	writeFile(filepath, content, 'utf8');
	return filepath;
};