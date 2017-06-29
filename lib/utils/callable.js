// @flow

'use strict';

const { isFunction, isInvalid } = require('./is');

/**
 * Retrieve callable function for 'fnName' of 'context'
 */
module.exports = function callable(
  context/*: function | any */,
  fnName/*: ?string */,
  ...args/*: Array<any> */
)/*: function */ {
  const fn/*: function */ = isInvalid(fnName) && isFunction(context) ? context : context[fnName];

  return function callableFunction(...moreArgs/*: Array<any> */) {
    // console.log(context && context.id, fnName)
    fn.call(context, ...args, ...moreArgs);
  };
};
