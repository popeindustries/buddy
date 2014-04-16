var SEG_LENGTH = 30;

/**
 *
 */
module.exports = function (str) {
	if (str.length > (SEG_LENGTH * 2) + 3) {
		return str.slice(0, SEG_LENGTH) + '...' + str.slice(-SEG_LENGTH);
	} else {
		return str;
	}
};