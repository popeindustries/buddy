/**
 * Wrap 'string' in comment based on 'type'
 * @param {String} string
 * @param {String} type
 * @returns {String}
 */
module.exports = function (string, type) {
	var open, close;

	if (type == 'html') {
		open = '<!-- ';
		close = ' -->';
	} else {
		open = '/* ';
		close = ' */';
	}

	return open + string + close;
};