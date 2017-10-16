// @flow

'use strict';

export type IsUtils = {
  isPlainObject: (any) => boolean,
  isEmptyArray: (Array<any>) => boolean,
  isFunction: (() => any) => boolean,
  isString: (any) => boolean,
  isNumber: (any) => boolean,
  isObject: (any) => boolean,
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
  isInvalid,
  isNullOrUndefined
};

/**
 * Determine if 'o' is an empty Array
 */
function isEmptyArray(o: Array<any>): boolean %checks {
  return Array.isArray(o) && o.length === 0;
}

/**
 * Determine if 'o' is a Function
 */
function isFunction(o: () => any): boolean %checks {
  return typeof o === 'function';
}

/**
 * Determine if 'o' is a String
 */
function isString(o: any): boolean %checks {
  return typeof o === 'string';
}

/**
 * Determine if 'o' is a Number
 */
function isNumber(o: any): boolean %checks {
  return typeof o === 'number';
}

/**
 * Determine if 'o' is an Object
 */
function isObject(o: any): boolean %checks {
  return o != null && typeof o === 'object' && !Array.isArray(o);
}

/**
 * Determine if 'o' is invalid
 */
function isInvalid(o: any): boolean %checks {
  return o === null || o === undefined || o === false || o === '';
}

/**
 * Determine if 'o' is null or undefined
 */
function isNullOrUndefined(o: any): boolean %checks {
  return o === null || o === undefined;
}
