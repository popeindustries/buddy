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
        const source = `${state.opts.store}['${state.opts.id}']`;

        if (path.matchesPattern('module.exports')) {
          path.replaceWithSourceString(source);
        } else if (path.matchesPattern('exports.*')) {
          path.get('object').replaceWithSourceString(source);
        }
      }
    }
  };
};