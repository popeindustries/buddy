'use strict';

const { walk } = require('recur-fs');
const fs = require('fs');
const path = require('path');

/**
 * Walk directory tree from cwd to find nearest buddy dir
 * @param {Boolean} useCli
 * @param {Function} fn(err, buddyFactory, version)
 */
module.exports = function find (useCli, fn) {
  function load (buddy) {
    try {
      const buddyFactory = require(buddy);
      const version = require(path.join(buddy, 'package.json')).version;

      fn(null, buddyFactory, version);
    } catch (err) {
      if (err.message == 'missing path') {
        fn(Error(useCli ? 'a local version of buddy wasn\'t found on this path' : 'buddy not found'));
      } else {
        fn(err);
      }
    }
  }

  // Loaded via buddy-cli
  if (useCli) {
    let stop = false;
    let buddy;

    walk(process.cwd(), (resource, stat, next) => {
      if (stat.isDirectory()) {
        if (path.basename(resource) == 'buddy') {
          buddy = resource;
          stop = true;
        } else if (path.basename(resource) == 'node_modules') {
          resource = path.join(resource, 'buddy');
          if (fs.existsSync(resource)) {
            buddy = resource;
            stop = true;
          }
        }
      }
      next(stop);
    }, (err) => {
      if (err) return fn(err);
      load(buddy);
    });

  // Loaded as buddy dependency
  } else {
    // main is buddy/bin/buddy
    load(path.join(path.dirname(require.main.filename), '..'));
  }
};