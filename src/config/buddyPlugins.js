// @flow

'use strict';

type BuddyPlugin = {
  name: string,
  type: string,
  register: Config => void
};
type BuddyPlugins = Map<string, BuddyPlugin>;
import type Config from './index';
export type { BuddyPlugin, BuddyPlugins };

const { strong, warn } = require('../utils/cnsl');
const fs = require('fs');
const path = require('path');

// Require here to allow for bundling
const DEFAULT_PLUGINS = [
  require('../plugins/css'),
  require('../plugins/html'),
  require('../plugins/img'),
  require('../plugins/js'),
  require('../plugins/json')
];
const DEFAULT_PLUGINS_DIR = 'buddy-plugins';
const RE_JS_FILE = /\.js$/;
const RE_PLUGIN = /^buddy-plugin-/;

module.exports = {
  /**
   * Load default/global buddy plugins
   */
  load(): BuddyPlugins {
    const cwd = process.cwd();
    const plugins: BuddyPlugins = new Map();

    // Load default and additional modules
    DEFAULT_PLUGINS.forEach(module => {
      requirePlugin(module, plugins);
    });
    // Load from project node_modules dir
    loadPluginsFromDir(path.join(cwd, 'node_modules'), plugins);
    // Load from project buddy-plugins dir
    loadPluginsFromDir(path.join(cwd, DEFAULT_PLUGINS_DIR), plugins);

    return plugins;
  }
};

/**
 * Load plugins in 'dir'
 */
function loadPluginsFromDir(dir: string, plugins: BuddyPlugins) {
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
        requirePlugin(path.join(dir, resource), plugins);
      });
  } catch (err) {
    /* ignore */
  }
}

/**
 * Register plugin 'resource'
 */
function requirePlugin(resource: string | BuddyPlugin, plugins: BuddyPlugins) {
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

  plugins.set(pluginModule.name, pluginModule);
}
