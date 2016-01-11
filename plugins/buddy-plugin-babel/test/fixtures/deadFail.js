SomeClass.prototype.someMethod = function () {
	for (var prop in this.stuff) {
		this.stuff[prop].doSomething();
	}
};
