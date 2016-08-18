'use strict';

module.exports = function (babel) {
  const t = babel.types;

  return {
    visitor: {
      ClassDeclaration (path) {
        if (path.parent.type == 'Program') {

        }
      },
      FunctionDeclaration (path) {
      },
      VariableDeclaration (path) {

      }
    }
  };
};