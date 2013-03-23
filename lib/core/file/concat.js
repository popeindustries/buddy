/**
 * Concatenate all dependencies for 'file'
 * @param {Object} file
 * @param {Object} options
 * @param {Function} fn(err, file)
 */
module.exports = function(file, options, fn) {
	fn(null, file);
};