'use strict';

const dependencies = require('./dependencies');

const BUDDY_SERVER = 'buddy-server';

/**
 * Parse and validate "server" section of 'config'
 * @param {Object} config
 */
module.exports = function serverParser (config) {
  if (config.runtimeOptions.serve || config.runtimeOptions.reload) {
    // Make sure 'buddy-server' module is installed when running '--serve' and/or '--reload'
    if (!dependencies.find(BUDDY_SERVER)) dependencies.install(BUDDY_SERVER);
  }
};