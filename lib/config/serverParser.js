'use strict';

const { isArray, isInvalid, isNullOrUndefined } = require('../utils/is');
const dependencies = require('./dependencies');
const path = require('path');

const BUDDY_SERVER = 'buddy-server';

/**
 * Parse and validate "server" section of 'config'
 * @param {Object} config
 */
module.exports = function serverParser(config) {
  const { runtimeOptions, server } = config;

  // Make sure 'buddy-server' module exists if running '--serve' and/or '--reload'
  if (runtimeOptions.serve || runtimeOptions.reload) {
    let buddyServerPath = dependencies.find(BUDDY_SERVER);

    if (isInvalid(buddyServerPath)) {
      dependencies.install(BUDDY_SERVER, true);
      buddyServerPath = dependencies.find(BUDDY_SERVER);
    }
    server.buddyServerPath = buddyServerPath;
  }

  // Handle array of directories
  if (!isNullOrUndefined(server.directory) && isArray(server.directory)) {
    const [directory, ...extraDirectories] = server.directory;

    server.directory = directory;
    server.extraDirectories = extraDirectories.map(directory => path.resolve(directory));
  }
  server.directory = path.resolve(server.directory);
  if (!isNullOrUndefined(server.file)) {
    server.file = path.resolve(server.file);
  }
  if (isNullOrUndefined(server.sourceroot)) {
    server.sourceroot = '';
  }
  server.webroot = isInvalid(server.webroot) ? server.directory : path.resolve(server.webroot);
};
