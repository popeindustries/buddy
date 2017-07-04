// @flow

'use strict';

export type CallableUtils = (Object | () => mixed, ?string, Array<any>) => (Array<any>) => mixed;

const { isFunction, isInvalid } = require('./is');

/**
 * Retrieve callable function for 'fnName' of 'context'
 */
module.exports = function callable(
  context: Object | () => mixed,
  fnName: ?string,
  ...args: Array<any>
): (...args: Array<any>) => mixed {
  const fn: () => mixed = isInvalid(fnName) && isFunction(context) ? context : context[fnName];

  return function callableFunction(...moreArgs: Array<any>) {
    // console.log(context && context.id, fnName)
    fn.call(context, ...args, ...moreArgs);
  };
};
