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
        }
      },

      Identifier (path, state) {
        const { opts } = state;

        console.log(opts.id, path.node.loc)
        if (path.node.name == 'exports') {
          // if (!opts.moduleObjectInited) {
          //   path.parentPath.insertBefore(
          //     t.expressionStatement(
          //       t.assignmentExpression('=',
          //         t.memberExpression(t.identifier(opts.moduleObject), t.identifier(opts.id), true),
          //         t.objectExpression([])
          //       )
          //     )
          //   );
          //   opts.moduleObjectInited = true;
          // }
          path.replaceWithSourceString(opts.source);
        }
      }
    }
  };
};