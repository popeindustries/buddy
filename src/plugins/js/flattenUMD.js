// @flow

'use strict';

const { isNullOrUndefined } = require('../../utils/is');

const RE_UMD_BOILERPLATE = /^[\s\S]{1,1000}typeof define\s?===\s?["']function["']\s?&&\s?define\.amd/;
const RE_MODULE = /module/g;
const RE_EXPORTS = /[^.](exports)/g;

/**
 * Flatten UMD 'content'
 */
module.exports = function flattenUMD(content: string, moduleString: string): string {
  const match = RE_UMD_BOILERPLATE.exec(content);
  const boilerplate = !isNullOrUndefined(match) && match[0];

  if (boilerplate) {
    content = content.replace(
      boilerplate,
      boilerplate
        .replace(RE_MODULE, moduleString)
        .replace(RE_EXPORTS, (match, p1) => match.replace(p1, `${moduleString}.exports`))
    );
  }

  return content;
};
