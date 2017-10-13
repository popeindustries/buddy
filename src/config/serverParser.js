// @flow

'use strict';

import type { RuntimeOptions, ServerOptions } from './index';

const { isInvalid } = require('../utils/is');
const dependencies = require('./dependencies');
const path = require('path');

const BUDDY_SERVER = 'buddy-server';
const DEFAULT: ServerOptions = {
  directory: '.',
  extraDirectories: null,
  file: null,
  port: 8080
};

/**
 * Parse and validate "server" section of 'config'
 */
module.exports = function serverParser(serverConfig: Object, runtimeOptions: RuntimeOptions): ServerOptions {
  const server: ServerOptions = Object.assign({}, DEFAULT, serverConfig);

  // Make sure 'buddy-server' module exists if running '--serve' and/or '--reload'
  if (runtimeOptions.serve || runtimeOptions.reload) {
    let buddyServerPath = dependencies.find(BUDDY_SERVER);

    if (isInvalid(buddyServerPath)) {
      dependencies.install([BUDDY_SERVER], true);
      buddyServerPath = dependencies.find(BUDDY_SERVER);
    }
    server.buddyServerPath = buddyServerPath;
  }

  // Handle array of directories
  if (server.directory != null && Array.isArray(server.directory)) {
    const [directory, ...extraDirectories] = server.directory;

    server.directory = directory;
    server.extraDirectories = extraDirectories.map(directory => path.resolve(directory));
  }
  server.directory = path.resolve(server.directory);
  if (server.file != null) {
    server.file = path.resolve(server.file);
  }

  return server;
};
