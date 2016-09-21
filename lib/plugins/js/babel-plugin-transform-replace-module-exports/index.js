'use strict';

/**
 * Plugin to namespace all declarations in root scope
 * @param {Babel} babel
 * @returns {Object}
 */
module.exports = function replaceModuleExports (babel) {
  return {
    visitor: {
      MemberExpression (path, state) {
        if (path.matchesPattern('module.exports')) {
          path.replaceWithSourceString(state.opts.source);
        } else if (path.matchesPattern('exports.*')) {
          path.get('object').replaceWithSourceString(state.opts.source);
        }
      }
    }
  };
};