// @flow

'use strict';

export type IsUtils = {
  isPlainObject: (Object) => boolean,
  isEmptyArray: (Array<any>) => boolean,
  isFunction: (() => mixed) => boolean,
  isString: (string) => boolean,
  isNumber: (number) => boolean,
  isObject: (Object) => boolean,
  isInvalid: (any) => boolean
};

const isPlainObject = require('lodash/isPlainObject');

module.exports = {
  isPlainObject,
  isEmptyArray,
  isFunction,
  isString,
  isNumber,
  isObject,
  isInvalid
};

/**
 * Determine if 'o' is an empty Array
 */
function isEmptyArray(o: Array<any>): boolean {
  return Array.isArray(o) && o.length === 0;
}

/**
 * Determine if 'o' is a Function
 */
function isFunction(o: () => mixed): boolean {
  return typeof o === 'function';
}

/**
 * Determine if 'o' is a String
 */
function isString(o: string): boolean {
  return typeof o === 'string';
}

/**
 * Determine if 'o' is a Number
 */
function isNumber(o: number): boolean {
  return typeof o === 'number';
}

/**
 * Determine if 'o' is an Object
 */
function isObject(o: Object): boolean {
  return typeof o === 'object';
}

/**
 * Determine if 'o' is invalid
 */
function isInvalid(o: mixed): boolean {
  return o == null || o === false || o === '';
}
