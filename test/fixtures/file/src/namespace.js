const bar = require('bar');
let foo = require('./foo');
var boo;

console.log(foo, bar);

foo = bar;
foo && 'zoo';
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

function y (...rest) {
  console.log(rest)
}

var units = {};

var z = function () {
  var params = {
    units: function(v) {
      if (units[v]) {
        var t = units[v].t;
      }
    }
  };
};
