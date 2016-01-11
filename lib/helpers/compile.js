'use strict';

const chalk = require('chalk')
  , clone = require('lodash/lang/clone')
  , cnsl = require('../utils/cnsl')
  , fs = require('fs')
  , path = require('path')
  , print = cnsl.print
  , Cache = require('../utils/compileCache')
  , walk = require('recur-fs').walk

  , DEFAULT_COMPILERS = {
      'css': '',
      'html': '',
      'js': '',
      'json': ''
    }
  , DEFAULT_EXTENSIONS = {
      css: ['css'],
      html: ['html'],
      js: ['js', 'json']
    }
  , RE_PLUGIN = /^buddy-plugin-/

  , cache = Cache.create()
  , compilers = clone(DEFAULT_COMPILERS)
  , extensions = clone(DEFAULT_EXTENSIONS, true);

/**
 * Load plugins at 'filepath'.
 * Walks directory tree if necessary
 * @param {String} filepath
 * @returns {Object}
 */
exports.load = function load (filepath) {
  if (filepath) {
    // Register if path to plugin directory
    if (RE_PLUGIN.test(path.basename(filepath))) {
      register(filepath);
    } else {
      find(filepath);
    }
  } else {
    // Try project directory
    find(process.cwd());
    // Try parent directory
    find(path.dirname(__dirname));
  }

  return extensions;
};

/**
 * Determine if plugin 'extension' has been registered
 * @param {String} extension
 * @returns {Boolean}
 */
exports.hasPlugin = function hasPlugin (extension) {
  return compilers[extension] != null;
};

/**
 * Convert contents to js/css/html
 * @param {String} filepath
 * @param {String} content
 * @param {Object} [options]
 * @param {Function} fn(err, content)
 */
exports.compile = function compile (filepath, content, options, fn) {
  if ('function' == typeof options) {
    fn = options;
    options = {};
  }

  const extension = path.extname(filepath)
    , name = path.basename(filepath).replace(extension, '');

  options.filepath = options.filename = filepath;
  options.extension = extension = extension.slice(1);
  options.name = name;
  options.cache = cache;

  if (compilers[extension]) {
    compilers[extension].compile(content, options, fn);
  // Pass through defaults
  } else if (compilers[extension] != null) {
    fn(null, content);
  } else {
    fn(new Error('no plugin registered to handle: ' + filepath + '\nplugins are installed with npm (https://github.com/popeindustries/transfigure)'));
  }
};

/**
 * Retrieve helper content by 'type'
 * @param {String} type
 * @returns {String}
 */
exports.getHelpers = function getHelpers (type) {
  return cache.getSource(type + '-helpers') || '';
};

/**
 * Clear template caches
 */
exports.clearCache = function clearCache () {
  cache.reset();
};

/**
 * Clear
 */
exports.clear = function clear () {
  module.exports.clearCache();
  compilers = clone(DEFAULT_COMPILERS);
  extensions = clone(DEFAULT_EXTENSIONS, true);
};

/**
 * Walk 'dir' looking for plugins
 * @param {String} dir
 */
function find (dir) {
  const cwd = process.cwd();

  try {
    walk.sync(dir, (resource, stat) => {
      // Stop if out of project dir
      if (!~resource.indexOf(cwd)) return true;

      if (stat.isDirectory()) {
        const basename = path.basename(resource);

        if (RE_PLUGIN.test(basename)) {
          register(resource);
        // Check inside node_modules
        } else if (path.basename(basename) == 'node_modules') {
          fs.readdirSync(resource).forEach((file) => {
            register(path.join(resource, file));
          });
        }
      }
    });
  } catch (err) {
    // Stop here
  }
}

/**
 * Register 'resource'
 * @param {String} resource
 */
function register (resource) {
  if (RE_PLUGIN.test(path.basename(resource))) {
    try {
      const module = require(resource);

      plugin(module, resource);
    } catch (err) {
      print(chalk.bold.yellow('warning ') + 'unable to load plugin ' + chalk.bold.grey(resource));
    }
  }
}

/**
 * Plugin 'module'
 * @param {Object} module
 * @param {String} resource
 */
function plugin (module, resource) {
  // Validate
  if (module.registration
    && module.registration.extensions
    && module.compile
    && 'function' == typeof module.compile) {
      const types = module.registration.extensions;

      for (const type in types) {
        const exts = types[type];

        // Convert to array
        if ('string' == typeof exts) exts = [exts];
        exts.forEach((ext) => {
          // Don't overwrite if already stored
          if (!compilers[ext]) {
            // Store
            if (!~extensions[type].indexOf(ext)) extensions[type].push(ext);
            compilers[ext] = module;
            print('registered transfigure plugin ' + chalk.bold.grey(module.registration.name) + ' for .' + ext, 2);
          }
        });
      }
  } else {
    print(chalk.bold.red('error ') + 'invalid plugin ' + chalk.bold.grey(resource));
    throw new Error('invalid plugin');
  }
}