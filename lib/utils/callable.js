'use strict';

const { isFunction, isInvalid } = require('./is');

/**
 * Retrieve callable function for 'fnName' of 'context'
 * @param {Object} context
 * @param {String} fnName
 * @param {Array} [args]
 * @returns {Function}
 */
module.exports = function callable(context, fnName, ...args) {
  const fn = isInvalid(fnName) && isFunction(context) ? context : context[fnName];

  return function callableFunction(...moreArgs) {
    // console.log(context && context.id, fnName)
    fn.call(context, ...args, ...moreArgs);
  };
};
