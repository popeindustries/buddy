'use strict';

const {
  isPlainObject,
  isEmptyArray,
  isFunction,
  isString,
  isNumber,
  isObject,
  isInvalid,
  isNullOrUndefined
} = require('../../lib/utils/is');
const expect = require('expect.js');
const path = require('path');

describe('is', () => {
  before(() => {
    process.chdir(path.resolve(__dirname, 'fixtures'));
  });

  describe('isEmptyArray()', () => {
    it('should return "true" for empty array', () => {
      expect(isEmptyArray([])).to.equal(true);
    });
    it('should return "false" for non empty array', () => {
      expect(isEmptyArray(['foo'])).to.equal(false);
    });
    it('should return "false" for plain object', () => {
      expect(isEmptyArray({})).to.equal(false);
    });
    it('should return "false" for undefined', () => {
      expect(isEmptyArray(undefined)).to.equal(false);
    });
    it('should return "false" for null', () => {
      expect(isEmptyArray(null)).to.equal(false);
    });
    it('should return "false" for string', () => {
      expect(isEmptyArray('foo')).to.equal(false);
    });
    it('should return "false" for number', () => {
      expect(isEmptyArray(1)).to.equal(false);
    });
    it('should return "false" for function', () => {
      expect(isEmptyArray(() => {})).to.equal(false);
    });
    it('should return "false" for instance', () => {
      expect(isEmptyArray(new Date())).to.equal(false);
    });
    it('should return "false" for object', () => {
      expect(isEmptyArray(global)).to.equal(false);
    });
  });

  describe('isPlainObject()', () => {
    it('should return "true" for plain object', () => {
      expect(isPlainObject({})).to.equal(true);
    });
    it('should return "false" for undefined', () => {
      expect(isPlainObject(undefined)).to.equal(false);
    });
    it('should return "false" for null', () => {
      expect(isPlainObject(null)).to.equal(false);
    });
    it('should return "false" for string', () => {
      expect(isPlainObject('foo')).to.equal(false);
    });
    it('should return "false" for number', () => {
      expect(isPlainObject(1)).to.equal(false);
    });
    it('should return "false" for function', () => {
      expect(isPlainObject(() => {})).to.equal(false);
    });
    it('should return "false" for instance', () => {
      expect(isPlainObject(new Date())).to.equal(false);
    });
    it('should return "false" for object', () => {
      expect(isPlainObject(global)).to.equal(false);
    });
  });

  describe('isFunction', () => {
    it('should return "true" for function', () => {
      expect(isFunction(() => {})).to.equal(true);
    });
    it('should return "false" for plain object', () => {
      expect(isFunction({})).to.equal(false);
    });
    it('should return "false" for undefined', () => {
      expect(isFunction(undefined)).to.equal(false);
    });
    it('should return "false" for null', () => {
      expect(isFunction(null)).to.equal(false);
    });
    it('should return "false" for string', () => {
      expect(isFunction('foo')).to.equal(false);
    });
    it('should return "false" for number', () => {
      expect(isFunction(1)).to.equal(false);
    });
    it('should return "false" for instance', () => {
      expect(isFunction(new Date())).to.equal(false);
    });
    it('should return "false" for object', () => {
      expect(isFunction(global)).to.equal(false);
    });
  });

  describe('isString', () => {
    it('should return "true" for string', () => {
      expect(isString('foo')).to.equal(true);
    });
    it('should return "false" for function', () => {
      expect(isString(() => {})).to.equal(false);
    });
    it('should return "false" for plain object', () => {
      expect(isString({})).to.equal(false);
    });
    it('should return "false" for undefined', () => {
      expect(isString(undefined)).to.equal(false);
    });
    it('should return "false" for null', () => {
      expect(isString(null)).to.equal(false);
    });
    it('should return "false" for number', () => {
      expect(isString(1)).to.equal(false);
    });
    it('should return "false" for instance', () => {
      expect(isString(new Date())).to.equal(false);
    });
    it('should return "false" for object', () => {
      expect(isString(global)).to.equal(false);
    });
  });

  describe('isNumber', () => {
    it('should return "true" for number', () => {
      expect(isNumber(1)).to.equal(true);
    });
    it('should return "false" for string', () => {
      expect(isNumber('foo')).to.equal(false);
    });
    it('should return "false" for function', () => {
      expect(isNumber(() => {})).to.equal(false);
    });
    it('should return "false" for plain object', () => {
      expect(isNumber({})).to.equal(false);
    });
    it('should return "false" for undefined', () => {
      expect(isNumber(undefined)).to.equal(false);
    });
    it('should return "false" for null', () => {
      expect(isNumber(null)).to.equal(false);
    });
    it('should return "false" for instance', () => {
      expect(isNumber(new Date())).to.equal(false);
    });
    it('should return "false" for object', () => {
      expect(isNumber(global)).to.equal(false);
    });
  });

  describe('isObject', () => {
    it('should return "true" for plain object', () => {
      expect(isObject({})).to.equal(true);
    });
    it('should return "true" for instance', () => {
      expect(isObject(new Date())).to.equal(true);
    });
    it('should return "true" for object', () => {
      expect(isObject(global)).to.equal(true);
    });
    it('should return "false" for number', () => {
      expect(isObject(1)).to.equal(false);
    });
    it('should return "false" for string', () => {
      expect(isObject('foo')).to.equal(false);
    });
    it('should return "false" for function', () => {
      expect(isObject(() => {})).to.equal(false);
    });
    it('should return "false" for undefined', () => {
      expect(isObject(undefined)).to.equal(false);
    });
    it('should return "false" for null', () => {
      expect(isObject(null)).to.equal(false);
    });
  });

  describe('isInvalid', () => {
    it('should return "true" for undefined', () => {
      expect(isInvalid(undefined)).to.equal(true);
    });
    it('should return "true" for null', () => {
      expect(isInvalid(null)).to.equal(true);
    });
    it('should return "true" for empty string', () => {
      expect(isInvalid('')).to.equal(true);
    });
    it('should return "true" for boolean false', () => {
      expect(isInvalid(false)).to.equal(true);
    });
    it('should return "false" for boolean true', () => {
      expect(isInvalid(true)).to.equal(false);
    });
    it('should return "false" for number', () => {
      expect(isInvalid(1)).to.equal(false);
    });
    it('should return "false" for string', () => {
      expect(isInvalid('foo')).to.equal(false);
    });
    it('should return "false" for function', () => {
      expect(isInvalid(() => {})).to.equal(false);
    });
    it('should return "false" for plain object', () => {
      expect(isInvalid({})).to.equal(false);
    });
    it('should return "false" for instance', () => {
      expect(isInvalid(new Date())).to.equal(false);
    });
    it('should return "false" for object', () => {
      expect(isInvalid(global)).to.equal(false);
    });
  });

  describe('isNullOrUndefined()', () => {
    it('should return "true" for undefined', () => {
      expect(isNullOrUndefined(undefined)).to.equal(true);
    });
    it('should return "true" for null', () => {
      expect(isNullOrUndefined(null)).to.equal(true);
    });
    it('should return "false" for plain object', () => {
      expect(isNullOrUndefined({})).to.equal(false);
    });
    it('should return "false" for string', () => {
      expect(isNullOrUndefined('foo')).to.equal(false);
    });
    it('should return "false" for number', () => {
      expect(isNullOrUndefined(1)).to.equal(false);
    });
    it('should return "false" for function', () => {
      expect(isNullOrUndefined(() => {})).to.equal(false);
    });
    it('should return "false" for instance', () => {
      expect(isNullOrUndefined(new Date())).to.equal(false);
    });
    it('should return "false" for object', () => {
      expect(isNullOrUndefined(global)).to.equal(false);
    });
  });
});
