'use strict';

const mkdir = require('recur-fs').mkdir.sync;
const writeFile = require('fs').writeFileSync;

/**
 * Write 'file' content's to disk
 * @param {File} file
 * @returns {String}
 */
module.exports = function (file) {
  mkdir(file.filepath);
  writeFile(file.filepath, file.content, 'utf8');
  return file.filepath;
};