'use strict';

const dependencies = require('./dependencies');
const path = require('path');

const BUDDY_SERVER = 'buddy-server';

/**
 * Parse and validate "server" section of 'config'
 * @param {Object} config
 */
module.exports = function serverParser (config) {
  const { runtimeOptions, server } = config;

  // Make sure 'buddy-server' module exists if running '--serve' and/or '--reload'
  if (runtimeOptions.serve || runtimeOptions.reload) {
    let buddyServerPath = dependencies.find(BUDDY_SERVER);

    if (!buddyServerPath) {
      dependencies.install(BUDDY_SERVER);
      buddyServerPath = dependencies.find(BUDDY_SERVER);
    }
    server.buddyServerPath = buddyServerPath;
  }

  server.directory = path.resolve(server.directory);
  if (server.file) server.file = path.resolve(server.file);
  if (!server.sourceroot) server.sourceroot = '';
  server.webroot = (!server.webroot) ? server.directory : path.resolve(server.webroot);
};