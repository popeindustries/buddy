const bar = require('bar');
const foo = require('./foo');

class Foo {
  constructor () {
    console.log(foo);
  }
}

function bat (foo) {
  const f = new Foo();

  console.log(f, foo, bar, 'bat');
}

for (let foo = 0; foo < 3; foo++) {
  bat(foo);
}

module.exports = foo;