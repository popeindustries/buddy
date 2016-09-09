// Arrow function
[].map(v => v + 1);

// Block scoping
let bar = 'bar';
{
	let bar = 'foo';
}

// Classes
class Bar extends Foo {
	constructor () {
		super();

		this.name = 'bar';
	}
}

// Constants
const BAR = 'bar';

// Destructuring
let [a, , b] = [1,2,3];

// Parameters
function f (x, y = 1, z = 2) {
  return x + y;
}

// Enhanced object literals
let obj = {
	bar,
	[ "prop_" + (() => 42)() ]: 42
}

// Spread
function g (x, ...y) {
  // y is an Array
  return x * y.length;
}

// Template literals
GET`http://foo.org/bar?a=${a}&b=${b}
    Content-Type: application/json
    X-Credentials: ${credentials}
    { "foo": ${foo},
      "bar": ${bar}}`(myOnReadyStateChangeHandler);

// Regex unicode
"𠮷".match(/./u)[0].length == 2