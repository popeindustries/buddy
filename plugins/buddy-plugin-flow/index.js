'use strict';

/**
 * Retrieve registration data
 */
exports.registration = {
  name: 'flow',
  babel: {
    plugins: [
      require('babel-plugin-syntax-flow'),
      // Experimental, but needed for type syntax in Class constructors
      require('babel-plugin-transform-class-properties'),
      require('babel-plugin-transform-flow-strip-types')
    ]
  }
};