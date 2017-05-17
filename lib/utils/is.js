'use strict';

module.exports = {
  isArray: Array.isArray,
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
 * @param {*} o
 * @returns {Boolean}
 */
function isEmptyArray(o) {
  return Array.isArray(o) && o.length === 0;
}

/**
 * Determine if 'o' is a Function
 * @param {*} o
 * @returns {Boolean}
 */
function isFunction(o) {
  return typeof o === 'function';
}

/**
 * Determine if 'o' is a String
 * @param {*} o
 * @returns {Boolean}
 */
function isString(o) {
  return typeof o === 'string';
}

/**
 * Determine if 'o' is a Number
 * @param {*} o
 * @returns {Boolean}
 */
function isNumber(o) {
  return typeof o === 'number';
}

/**
 * Determine if 'o' is an Object
 * @param {*} o
 * @returns {Boolean}
 */
function isObject(o) {
  return typeof o === 'object';
}

/**
 * Determine if 'o' is Null
 * @param {*} o
 * @returns {Boolean}
 */
function isNull(o) {
  return o === null;
}

/**
 * Determine if 'o' is undefined
 * @param {*} o
 * @returns {Boolean}
 */
function isUndefined(o) {
  return o === void 0;
}

/**
 * Determine if 'o' is Null or undefined
 * @param {*} o
 * @returns {Boolean}
 */
function isNullOrUndefined(o) {
  return isUndefined(o) || isNull(o);
}

/**
 * Determine if 'o' is invalid
 * @param {*} o
 * @returns {Boolean}
 */
function isInvalid(o) {
  return isUndefined(o) || isNull(o) || o === false || o === '';
}
