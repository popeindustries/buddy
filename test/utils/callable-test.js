'use strict';

const { expect } = require('chai');
const callable = require('../../lib/utils/callable');
const path = require('path');

describe('callable', () => {
  before(() => {
    process.chdir(path.resolve(__dirname, 'fixtures'));
  });

  it('should return a function bound to passed context', () => {
    const obj = {
      bar: 0,
      foo() {
        this.bar++;
      }
    };
    const fn = callable(obj, 'foo');

    fn();
    expect(obj.bar).to.equal(1);
  });
  it('should return a function with memoized arguments', () => {
    const obj = {
      bar: 0,
      foo(val) {
        this.bar = val;
      }
    };
    const fn = callable(obj, 'foo', 2);

    fn();
    expect(obj.bar).to.equal(2);
  });
  it('should return a function accepting passed arguments', () => {
    const obj = {
      bar: 0,
      foo(val) {
        this.bar = val;
      }
    };
    const fn = callable(obj, 'foo');

    fn(2);
    expect(obj.bar).to.equal(2);
  });
});
