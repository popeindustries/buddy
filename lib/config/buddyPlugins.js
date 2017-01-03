'use strict';

const { print, strong, warn } = require('../utils/cnsl');
const fs = require('fs');
const path = require('path');

// Require here to allow for bundling
const DEFAULT_PLUGINS = [
  require('../plugins/css'),
  require('../plugins/flow'),
  require('../plugins/html'),
  require('../plugins/img'),
  require('../plugins/js'),
  require('../plugins/json'),
  require('../plugins/react'),
  require('../plugins/uglify')
];
const RE_JS_FILE = /\.js$/;
const RE_PLUGIN = /^buddy-plugin-/;

module.exports = {
  /**
   * Load default/global buddy plugins
   * @param {Object} config
   * @param {Array} [additionalPluginModules]
   */
  load (config, additionalPluginModules = []) {
    const cwd = process.cwd();
    const projectModules = path.join(cwd, 'node_modules');
    const projectPluginModules = path.join(cwd, 'buddy-plugins');

    // Load default and additional modules
    DEFAULT_PLUGINS
      .concat(additionalPluginModules)
      .forEach((module) => {
        registerPlugin(module, config, true);
      });
    // Load from project node_modules dir
    loadPluginsFromDir(projectModules, config);
    // Load from project buddy-plugins dir
    if (fs.existsSync(projectPluginModules)) loadPluginsFromDir(projectPluginModules, config);
  }
};

/**
 * Load plugins in 'dir'
 * @param {String} dir
 * @param {Object} config
 */
function loadPluginsFromDir (dir, config) {
  if (!fs.existsSync(dir)) return;

  fs.readdirSync(dir)
    .filter((resource) => {
      if (path.basename(dir) != 'plugins') return RE_PLUGIN.test(resource);
      return RE_JS_FILE.test(resource) || fs.statSync(path.join(dir, resource)).isDirectory();
    })
    .forEach((resource) => {
      registerPlugin(path.join(dir, resource), config);
    });
}

/**
 * Register plugin 'resource'
 * @param {String} resource
 * @param {Object} config
 * @param {Boolean} [silent]
 * @returns {null}
 */
function registerPlugin (resource, config, silent) {
  let module;

  try {
    module = ('string' == typeof resource) ? require(resource) : resource;
  } catch (err) {
    return warn(`unable to load plugin ${strong(resource)}`);
  }

  if (!('register' in module)) return warn(`invalid plugin ${strong(resource)}`);

  module.register(config);
  if (!silent) print(`registered plugin ${strong(module.name)}`, 0);
}