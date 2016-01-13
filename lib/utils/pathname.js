'use strict';

const path = require('path');

/**
 * Retrieve path name (dirname/filename) of 'p'
 * @param {String} p
 * @returns {String}
 */
module.exports = function pathname (p) {
  p = path.resolve(p);

  let dir = path.resolve(p, '..');

  if (dir == process.cwd()) dir = '.';

  return path.basename(dir)
    + '/'
    + path.basename(p);
};