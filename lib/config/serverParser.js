'use strict';

const dependencies = require('./dependencies');

const BUDDY_SERVER = 'buddy-server';

/**
 * Parse and validate "server" section of 'config'
 * @param {Object} config
 */
module.exports = function serverParser (config) {
  // Make sure 'buddy-server' module exists if running '--serve' and/or '--reload'
  if (config.runtimeOptions.serve || config.runtimeOptions.reload) {
    let buddyServerPath = dependencies.find(BUDDY_SERVER);

    if (!buddyServerPath) {
      dependencies.install(BUDDY_SERVER);
      buddyServerPath = dependencies.find(BUDDY_SERVER);
    }
    config.server.buddyServerPath = buddyServerPath;
  }
};