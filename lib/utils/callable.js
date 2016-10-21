'use strict';

/**
 * Retrieve callable function for 'fnName' of 'context'
 * @param {Object} context
 * @param {String} fnName
 * @param {Array} [args]
 * @returns {Function}
 */
module.exports = function callable (context, fnName, ...args) {
  const fn = (!fnName && 'function' == typeof context)
    ? context
    : context[fnName];

  return function callableFunction (...moreArgs) {
    fn.call(context, ...args, ...moreArgs);
  };
};