'use strict';

const cnsl = require('./cnsl');
const exec = require('child_process').execSync;
const fs = require('fs');
const path = require('path');
const unique = require('lodash/uniq');

const BABEL_PRESET_2016 = [
  'babel-plugin-syntax-trailing-function-commas',
  'babel-plugin-transform-async-to-generator'
];
const BABEL_PRESET_2015 = [
  'babel-plugin-transform-exponentiation-operator'
];
const BABEL_PRESET_ES5 = [
  'babel-plugin-transform-es5-property-mutators',
  'babel-plugin-transform-es2015-arrow-functions',
  'babel-plugin-transform-es2015-block-scoped-functions',
  'babel-plugin-transform-es2015-block-scoping',
  'babel-plugin-transform-es2015-classes',
  'babel-plugin-transform-es2015-computed-properties',
  'babel-plugin-transform-es2015-destructuring',
  'babel-plugin-transform-es2015-duplicate-keys',
  'babel-plugin-transform-es2015-for-of',
  'babel-plugin-transform-es2015-function-name',
  'babel-plugin-transform-es2015-literals',
  'babel-plugin-transform-es2015-modules-commonjs',
  'babel-plugin-transform-es2015-object-super',
  'babel-plugin-transform-es2015-parameters',
  'babel-plugin-transform-es2015-shorthand-properties',
  'babel-plugin-transform-es2015-spread',
  'babel-plugin-transform-es2015-sticky-regex',
  'babel-plugin-transform-es2015-template-literals',
  // babel-plugin-transform-es2015-typeof-symbol,
  'babel-plugin-transform-es2015-unicode-regex'
  // babel-plugin-transform-regenerator
];
const BABEL_PRESET_NODE6 = ['babel-plugin-transform-es2015-modules-commonjs'];
const BABEL_PRESET_NODE4 = [
  'babel-plugin-transform-es2015-destructuring',
  'babel-plugin-transform-es2015-function-name',
  'babel-plugin-transform-es2015-modules-commonjs',
  'babel-plugin-transform-es2015-parameters',
  'babel-plugin-transform-es2015-shorthand-properties',
  'babel-plugin-transform-es2015-spread',
  'babel-plugin-transform-es2015-sticky-regex',
  'babel-plugin-transform-es2015-unicode-regex'
];
const BABEL_PRESET_DEFAULT = [require('babel-plugin-external-helpers')];
const RE_PLUGIN = /^buddy-plugin-|^transfigure-/;

const babelPlugins = {
  default: BABEL_PRESET_DEFAULT,
  es5: BABEL_PRESET_ES5.concat(BABEL_PRESET_2015, BABEL_PRESET_2016),
  es2015: BABEL_PRESET_2015.concat(BABEL_PRESET_2016),
  es2016: BABEL_PRESET_2016,
  node4: BABEL_PRESET_NODE4,
  node6: BABEL_PRESET_NODE6
};
const error = cnsl.error;
const print = cnsl.print;
const strong = cnsl.strong;
const warn = cnsl.warn;

// Alias
babelPlugins.es6 = babelPlugins.es2015;
babelPlugins.es7 = babelPlugins.es2016;

module.exports = {
  /**
   * Load core buddy plugins
   * @param {Object} config
   */
  core (config) {
    const cwd = process.cwd();
    const projectModules = path.join(cwd, 'node_modules');
    const buddyModules = path.resolve(__dirname, '../../node_modules');

    // Load from project dir
    loadBuddyPlugin(projectModules, config);
    // Load from buddy dir if buddy not installed in project dir
    if (!~buddyModules.indexOf(cwd)) loadBuddyPlugin(buddyModules, config);
  },

  /**
   * Load external plugins
   * @param {Object} version
   * @param {Object} options
   */
  external (version, options) {
    version = version || [];
    if (!Array.isArray(version)) version = [version];
    options.babel = options.babel || {};

    // Default plugins should already be loaded (including those registerd as buddy-plugins-*)
    let plugins = [babelPlugins.default];

    options.babel.plugins = unique(version.reduce((plugins, preset) => {
      return plugins.concat(babelPlugins[preset.toLowerCase()]);
    }, []).concat(options.babel.plugins || []));

    let dependencies = [];

    for (const prop in options) {
      dependencies = dependencies.concat(extractDependencyStrings(options[prop]));
    }

    const missingDependenciesString = dependencies.filter((dependency) => {
      return !require.resolve(dependency);
    }).join(' ');

    if (missingDependenciesString) {
      try {
        print(`installing the following missing dependencies: ${strong(missingDependenciesString)}`);
        exec(`npm --save-dev --save-exact install ${missingDependenciesString}`);
      } catch (err) {
        error(err);
      }
    }

    for (const prop in options) {
      resolveDependecyStrings(options[prop]);
    }

    plugins[1] = options.babel.plugins;
    options.babel.plugins = plugins;
  }
};

/**
 * Load plugins in 'dir'
 * @param {String} dir
 * @param {Object} config
 */
function loadBuddyPlugin (dir, config) {
  if (!fs.existsSync(dir)) return;

  fs.readdirSync(dir)
    .filter((resource) => {
      return RE_PLUGIN.test(resource);
    })
    .forEach((resource) => {
      registerBuddyPlugin(path.join(dir, resource), config);
    });
}

/**
 * Register plugin 'resource'
 * @param {String} resource
 * @param {Object} config
 * @returns {null}
 */
function registerBuddyPlugin (resource, config) {
  let module;

  try {
    module = require(resource);
  } catch (err) {
    return warn('unable to load plugin ' + strong(resource));
  }

  const types = module.registration.extensions;

  if (module.registration) {
    // Transpiler plugins
    if (module.registration.babel && module.registration.babel.plugins) {
      // Register optional file extensions
      if (types) {
        for (const type in types) {
          const exts = types[type];

          // Convert to array
          if (!Array.isArray(exts)) exts = [exts];
          exts.forEach((ext) => {
            if (!~config.fileExtensions[type].indexOf(ext)) config.fileExtensions[type].push(ext);
          });
        }
      }
      // Add to default
      babelPlugins.default = babelPlugins.default.concat(module.registration.babel.plugins);
      print(`registered transpiler plugin for ${strong(module.registration.name)}`, 0);
    // Compiler
    } else if (types && module.compile && 'function' == typeof module.compile) {
      for (const type in types) {
        const exts = types[type];

        // Convert to array
        if (!Array.isArray(exts)) exts = [exts];
        exts.forEach((ext) => {
          // Don't overwrite if already registered
          if (!config.compilers[ext]) {
            // Store
            if (!~config.fileExtensions[type].indexOf(ext)) config.fileExtensions[type].push(ext);
            config.compilers[ext] = module;
            print(`registered compiler plugin ${strong(module.registration.name)} for .${ext}`, 0);
          }
        });
      }
    } else if (module.registration.type && module.compress && 'function' == typeof module.compress) {
      const type = module.registration.type;

      // Don't overwrite if already registered
      if (!config.compressors[type]) {
        // Store
        config.compressors[type] = module;
        print(`registered compressor plugin ${strong(module.registration.name)} for ${type}`, 0);
      }
    } else {
      warn(`invalid plugin ${strong(resource)}`);
    }
  } else {
    warn(`invalid plugin ${strong(resource)}`);
  }
}

/**
 * Extract dependency strings from 'optionsItem'
 * @param {Object} optionsItem
 * @returns {Array}
 */
function extractDependencyStrings (optionsItem) {
  let dependencies = [];

  function extract (items) {
    // Invalid if not Array
    if (Array.isArray(items)) {
      items.reduce((dependencies, item) => {
        // Items can be Array with depedency as first param
        const dep = Array.isArray(item) ? item[0] : item;

        // Only gather string references, not functions/modules
        if ('string' == typeof dep) dependencies.push(dep);
        return dependencies;
      }, dependencies);
    }
  }

  if (optionsItem.plugins) extract(optionsItem.plugins);
  if (optionsItem.presets) extract(optionsItem.presets);

  return dependencies;
}

/**
 * Resolve dependency strings in 'optionsItem' to modules
 * @param {Object} optionsItem
 */
function resolveDependecyStrings (optionsItem) {
  function resolve (items) {
    // Invalid if not Array
    if (Array.isArray(items)) {
      items.forEach((item, idx, items) => {
        if (Array.isArray(item)) {
          item[0] = require(item[0]);
        } else {
          items[idx] = require(item);
        }
      });
    }
  }

  if (optionsItem.plugins) resolve(optionsItem.plugins);
  if (optionsItem.presets) resolve(optionsItem.presets);
}