var uglify = require('uglify-js')
	, csso = require('csso')
	, Promise = require('bluebird');

/**
 * Compress 'content'
 * @param {String} type
 * @param {String} content
 * @returns {Promise(content)}
 */
module.exports = Promise.method(function (type, content) {
	return (type == 'js')
		? uglify.minify(content, {fromString: true}).code
		: csso.justDoIt(content);
});