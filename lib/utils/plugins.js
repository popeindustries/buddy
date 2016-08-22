'use strict';

const cnsl = require('./cnsl');
const fs = require('fs');
const path = require('path');
const recurFs = require('recur-fs');

const JS_VERSION_2016 = [];
const JS_VERSION_2015 = [];
const JS_VERSIONS = {
  es5: [
    'babel-plugin-transform-es5-property-mutators',
    'babel-preset-es2015',
    'babel-preset-es2016'
  ],
  es2015: [
    'babel-preset-es2016'
  ],
  es2016: '',
  node4: '',
  node6: '',
  react: ['babel-preset-react'],
  flow: [
    'babel-plugin-transform-class-properties',
    'babel-plugin-transform-flow-strip-types'
  ]
};
JS_VERSIONS.es6 = JS_VERSIONS.es2015;
const RE_PLUGIN = /^buddy-plugin-|^transfigure-/;

const print = cnsl.print;
const strong = cnsl.strong;
const walk = recurFs.walk.sync;
const warn = cnsl.warn;

module.exports = {
  /**
   * Load buddy plugins
   * @param {Object} config
   */
  buddy (config) {
    const cwd = process.cwd();
    const nodeModules = path.join(cwd, 'node_modules');
    const buddy = path.resolve(__dirname, '..');

    const load = (dir) => {
      try {
        walk(dir, (resource, stat) => {
          // Stop if out of buddy/project directory
          if (!~resource.indexOf(`${path.sep}buddy${path.sep}`) && !~resource.indexOf(cwd)) return true;

          if (stat.isDirectory()) {
            const basename = path.basename(resource);

            if (RE_PLUGIN.test(basename)) {
              registerPlugin(resource, config);
            // Check inside node_modules
            } else if (path.basename(basename) == 'node_modules') {
              fs.readdirSync(resource)
                .filter((file) => {
                  return RE_PLUGIN.test(file);
                })
                .forEach((file) => {
                  registerPlugin(path.join(resource, file), config);
                });
            }
          }
        });
      } catch (err) {
        // Stop here
      }
    };

    load(nodeModules);
    // Load from buddy dir if buddy not installed in project dir
    if (!~cwd.indexOf(buddy)) load(buddy);
  },

  /**
   * Load Babel plugins
   * @param {Object} config
   */
  babel (config) {

  }
};

/**
 * Register plugin 'resource'
 * @param {String} resource
 * @param {Object} config
 * @returns {null}
 */
function registerPlugin (resource, config) {
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