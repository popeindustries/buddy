var ClassCamelCase = function() {
	this.someVar = 'hey';
};

ClassCamelCase.prototype.someFunc = function () {
	console.log(this.someVar);
};

module.exports = ClassCamelCase;