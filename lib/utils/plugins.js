'use strict';

const cnsl = require('./cnsl');
const exec = require('child_process').execSync
const fs = require('fs');
const path = require('path');
const unique = require('lodash/uniq');

const BABEL_PLUGINS_FOR_VERSION_2016 = [
  'babel-plugin-syntax-trailing-function-commas',
  'babel-plugin-transform-async-to-generator'
];
const BABEL_PLUGINS_FOR_VERSION_2015 = [
  'babel-plugin-transform-exponentiation-operator'
];
const BABEL_PLUGINS_FOR_VERSION_ES5 = [
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
const BABEL_PLUGINS_FOR_REACT = [
  'babel-plugin-syntax-jsx',
  'babel-plugin-transform-react-display-name',
  'babel-plugin-transform-react-jsx'
];
const BABEL_PLUGINS_FOR_NODE6 = ['babel-plugin-transform-es2015-modules-commonjs'];
const BABEL_PLUGINS_FOR_NODE4 = [
  'babel-plugin-transform-es2015-destructuring',
  'babel-plugin-transform-es2015-function-name',
  'babel-plugin-transform-es2015-modules-commonjs',
  'babel-plugin-transform-es2015-parameters',
  'babel-plugin-transform-es2015-shorthand-properties',
  'babel-plugin-transform-es2015-spread',
  'babel-plugin-transform-es2015-sticky-regex',
  'babel-plugin-transform-es2015-unicode-regex'
];
const BABEL_PLUGINS_FOR_FLOW = [
  'babel-plugin-syntax-flow',
  // Experimental, but needed for type syntax in constructor
  'babel-plugin-transform-class-properties',
  'babel-plugin-transform-flow-strip-types'
];
const BABEL_PLUGINS_DEFAULT = ['babel-plugin-external-helpers'].concat(BABEL_PLUGINS_FOR_REACT);
const BABEL_PLUGINS = {
  default: BABEL_PLUGINS_DEFAULT,
  es5: BABEL_PLUGINS_DEFAULT.concat(BABEL_PLUGINS_FOR_VERSION_ES5, BABEL_PLUGINS_FOR_VERSION_2015, BABEL_PLUGINS_FOR_VERSION_2016),
  es2015: BABEL_PLUGINS_DEFAULT.concat(BABEL_PLUGINS_FOR_VERSION_2015, BABEL_PLUGINS_FOR_VERSION_2016),
  es2016: BABEL_PLUGINS_DEFAULT.concat(BABEL_PLUGINS_FOR_VERSION_2016),
  node4: BABEL_PLUGINS_DEFAULT.concat(BABEL_PLUGINS_FOR_NODE4),
  node6: BABEL_PLUGINS_DEFAULT.concat(BABEL_PLUGINS_FOR_NODE6),
  react: BABEL_PLUGINS_FOR_REACT,
  flow: BABEL_PLUGINS_FOR_FLOW
};
BABEL_PLUGINS.es6 = BABEL_PLUGINS.es2015;
BABEL_PLUGINS.es7 = BABEL_PLUGINS.es2016;
const RE_PLUGIN = /^buddy-plugin-|^transfigure-/;

const error = cnsl.error;
const print = cnsl.print;
const strong = cnsl.strong;
const warn = cnsl.warn;

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
    version = version || ['default'];
    if (!Array.isArray(version)) version = [version];
    options.babel = options.babel || {};

    let dependencies = [];

    options.babel.plugins = unique(version.reduce((babelPlugins, preset) => {
      return babelPlugins.concat(BABEL_PLUGINS[preset]);
    }, []).concat(options.babel.plugins || []));

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

  if (module.registration) {
    // Compiler
    if (module.registration.extensions
      && module.compile
      && 'function' == typeof module.compile) {
        const types = module.registration.extensions;

        for (const type in types) {
          const exts = types[type];

          // Convert to array
          if ('string' == typeof exts) exts = [exts];
          exts.forEach((ext) => {
            // Don't overwrite if already registered
            if (!config.compilers[ext]) {
              // Store
              if (!~config.fileExtensions[type].indexOf(ext)) config.fileExtensions[type].push(ext);
              config.compilers[ext] = module;
              print('registered compiler plugin ' + strong(module.registration.name) + ' for .' + ext, 0);
            }
          });
        }
    } else if (module.registration.type
      && module.compress
      && 'function' == typeof module.compress) {
        const type = module.registration.type;

        // Don't overwrite if already registered
        if (!config.compressors[type]) {
          // Store
          config.compressors[type] = module;
          print('registered compressor plugin ' + strong(module.registration.name) + ' for ' + type, 0);
        }
    } else {
      warn('invalid plugin ' + strong(resource));
    }
  } else {
    warn('invalid plugin ' + strong(resource));
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
        // Items can be Array with depedency string as first param
        dependencies.push(Array.isArray(item) ? item[0] : item);
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