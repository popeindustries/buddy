'use strict';

/**
 * Plugin to namespace all declarations in root scope
 * @param {Babel} babel
 * @returns {Object}
 */
module.exports = function replaceModuleExports (babel) {
  const { types: t } = babel;

  return {
    visitor: {
      MemberExpression (path, state) {
        const { opts } = state;

        if (path.matchesPattern('module.exports')) {
          path.replaceWithSourceString(opts.source);
        } else if (path.matchesPattern('exports.*')) {
          if (!opts.moduleObjectInited) {
            path.parentPath.insertBefore(
              t.expressionStatement(
                t.assignmentExpression('=',
                  t.memberExpression(t.identifier(opts.moduleObject), t.identifier(opts.id), true),
                  t.objectExpression([])
                )
              )
            );
            opts.moduleObjectInited = true;
          }
          path.get('object').replaceWithSourceString(opts.source);
        }
      }
    }
  };
};