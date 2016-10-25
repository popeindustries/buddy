const bar = require('bar');
const Bar = require('Bar');
let foo = require('./foo');
var boo;

console.log(foo, bar);

foo = bar;
foo && 'zoo';
var baz = foo.baz;
var boo = {};
boo[baz] = 'baz';

class Foo extends Bar {
  constructor () {
    super()
    this.foo = foo;
    console.log(foo);
  }
}

function bat (foo, options = {}) {
  const f = new Foo();

  console.log(f, foo, bar, 'bat', options);
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

var zing;

if (true) {
  zing = 'zing';
}

var { a, b } = require('c');

function S () {
  Object.assign(S.prototype, { foo: foo });

  if (true) {
    S = new Proxy(S, {});
  }
}

if (true) {
  var t = {};
  let u;
  t.foo = 'c';
}