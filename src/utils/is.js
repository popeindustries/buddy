// @flow

'use strict';

const isPlainObject = require('lodash/isPlainObject');

module.exports = {
  isArray: Array.isArray,
  isPlainObject,
  isEmptyArray,
  isFunction,
  isString,
  isNumber,
  isObject,
  isNull,
  isUndefined,
  isNullOrUndefined,
  isInvalid
};

/**
 * Determine if 'o' is an empty Array
 */
function isEmptyArray(o: any): boolean {
  return Array.isArray(o) && o.length === 0;
}

/**
 * Determine if 'o' is a Function
 */
function isFunction(o: any): boolean {
  return typeof o === 'function';
}

/**
 * Determine if 'o' is a String
 */
function isString(o: any): boolean {
  return typeof o === 'string';
}

/**
 * Determine if 'o' is a Number
 */
function isNumber(o: any): boolean {
  return typeof o === 'number';
}

/**
 * Determine if 'o' is an Object
 */
function isObject(o: any): boolean {
  return typeof o === 'object';
}

/**
 * Determine if 'o' is Null
 */
function isNull(o: any): boolean {
  return o === null;
}

/**
 * Determine if 'o' is undefined
 */
function isUndefined(o: any): boolean {
  return o === void 0;
}

/**
 * Determine if 'o' is Null or undefined
 */
function isNullOrUndefined(o: any): boolean {
  return isUndefined(o) || isNull(o);
}

/**
 * Determine if 'o' is invalid
 */
function isInvalid(o: any): boolean {
  return isUndefined(o) || isNull(o) || o === false || o === '';
}
