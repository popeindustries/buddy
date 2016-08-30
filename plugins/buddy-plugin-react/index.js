'use strict';

module.exports = {
  name: 'react',
  type: 'js',
  config: {
    fileExtensions: ['jsx'],
    babel: {
      plugins: [
        require('babel-plugin-syntax-jsx'),
        require('babel-plugin-transform-react-display-name'),
        require('babel-plugin-transform-react-jsx')
      ]
    }
  }
};