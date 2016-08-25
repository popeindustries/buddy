'use strict';

/**
 * Retrieve registration data
 */
exports.registration = {
  name: 'react',
  extensions: {
    js: [
      'jsx'
    ]
  },
  babel: {
    plugins: [
      require('babel-plugin-syntax-jsx'),
      require('babel-plugin-transform-react-display-name'),
      require('babel-plugin-transform-react-jsx')
    ]
  }
};