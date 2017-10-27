// @flow

'use strict';

export type IsUtils = {
  isArray: mixed => boolean,
  isFilledArray: mixed => boolean,
  isFunction: mixed => boolean,
  isString: mixed => boolean,
  isNumber: mixed => boolean,
  isObject: mixed => boolean,
  isInvalid: mixed => boolean
};

module.exports = {
  isArray,
  isFilledArray,
  isFunction,
  isString,
  isNumber,
  isObject,
  isInvalid,
  isNullOrUndefined
};

/**
 * Determine if 'o' is an Array
 */
function isArray(o: mixed): boolean %checks {
  return Array.isArray(o);
}

/**
 * Determine if 'o' is an Array with content
 */
function isFilledArray(o: mixed): boolean %checks {
  return Array.isArray(o) && o.length >= 0;
}

/**
 * Determine if 'o' is a Function
 */
function isFunction(o: mixed): boolean %checks {
  return typeof o === 'function';
}

/**
 * Determine if 'o' is a String
 */
function isString(o: mixed): boolean %checks {
  return typeof o === 'string';
}

/**
 * Determine if 'o' is a Number
 */
function isNumber(o: mixed): boolean %checks {
  return typeof o === 'number';
}

/**
 * Determine if 'o' is an Object
 */
function isObject(o: mixed): boolean %checks {
  return o != null && typeof o === 'object' && !Array.isArray(o);
}

/**
 * Determine if 'o' is invalid
 */
function isInvalid(o: mixed): boolean %checks {
  return o === null || o === undefined || o === false || o === '';
}

/**
 * Determine if 'o' is null or undefined
 */
function isNullOrUndefined(o: mixed): boolean %checks {
  return o === null || o === undefined;
}
