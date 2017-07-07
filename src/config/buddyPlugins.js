// @flow

'use strict';

type Plugin = {
  name: string;
  type: string;
  register: (Config) => void;
}
import type Config from './index';

const { print, strong, warn } = require('../utils/cnsl');
const fs = require('fs');
const path = require('path');

// Require here to allow for bundling
const DEFAULT_PLUGINS = [
  require('../plugins/css'),
  require('../plugins/html'),
  require('../plugins/img'),
  require('../plugins/js'),
  require('../plugins/json'),
  require('../plugins/uglify')
];
const DEFAULT_PLUGINS_DIR = 'buddy-plugins';
const RE_JS_FILE = /\.js$/;
const RE_PLUGIN = /^buddy-plugin-/;

module.exports = {
  /**
   * Load default/global buddy plugins
   */
  load(config: Config) {
    const cwd = process.cwd();

    // Load default and additional modules
    DEFAULT_PLUGINS.forEach(module => {
      registerPlugin(module, config, true);
    });
    // Load from project node_modules dir
    loadPluginsFromDir(path.join(cwd, 'node_modules'), config);
    // Load from project buddy-plugins dir
    loadPluginsFromDir(path.join(cwd, DEFAULT_PLUGINS_DIR), config);
  }
};

/**
 * Load plugins in 'dir'
 */
function loadPluginsFromDir(dir: string, config: Config) {
  try {
    fs
      .readdirSync(dir)
      .filter(resource => {
        if (path.basename(dir) !== 'plugins') {
          return RE_PLUGIN.test(resource);
        }
        return RE_JS_FILE.test(resource) || fs.statSync(path.join(dir, resource)).isDirectory();
      })
      .forEach(resource => {
        registerPlugin(path.join(dir, resource), config);
      });
  } catch (err) {
    /* ignore */
  }
}

/**
 * Register plugin 'resource'
 */
function registerPlugin(resource: string | Plugin, config: Config, silent?: boolean) {
  let pluginModule: Plugin;

  if (typeof resource === 'string') {
    try {
      pluginModule = require(resource);
    } catch (err) {
      return void warn(`unable to load plugin ${strong(resource)}`);
    }
  } else {
    pluginModule = resource;
  }

  if (!('register' in pluginModule)) {
    return void warn(`invalid plugin ${strong(resource.toString())}`);
  }

  pluginModule.register(config);
  if (!silent) {
    print(`registered plugin ${strong(pluginModule.name)}`, 0);
  }
}
