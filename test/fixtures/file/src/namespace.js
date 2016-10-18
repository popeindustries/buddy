const bar = require('bar');
let foo = require('./foo');
var boo;

console.log(foo, bar);

foo = bar;
var baz = foo.baz;
var boo = {};
boo[baz] = 'baz';

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
  console.log(bar);
}

zip = {
  foo: foo
};