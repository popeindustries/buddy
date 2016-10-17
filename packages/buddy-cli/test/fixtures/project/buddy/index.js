module.exports = Builder;

function Builder () { };

Builder.prototype.build = function (configpath, options, fn) {
	console.log('build', configpath);
	console.error(JSON.stringify(options));
};