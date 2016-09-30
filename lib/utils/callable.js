'use strict';

/**
 * Retrieve callable function 'fn' with 'context' and optional 'args'
 * @param {Object} context
 * @param {Function} fn
 * @param {Array} args
 * @returns {Function}
 */
module.exports = function callable (context, fn, ...args) {
  return function callableFunction (...moreArgs) {
    process.nextTick(function asyncCallableFunction () {
      context[fn].call(context, ...args, ...moreArgs);
    });
  };
};