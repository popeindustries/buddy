'use strict';

const OPTIONS = {
  plugins: [
    require('babel-plugin-syntax-jsx'),
    require('babel-plugin-transform-react-display-name'),
    require('babel-plugin-transform-react-jsx')
  ]
};
const FILE_EXTENSIONS = ['jsx'];

module.exports = {
  name: 'react',
  type: 'js',

  /**
   * Register plugin
   * @param {Config} config
   */
  register (config) {
    config.registerFileExtensionsForType(FILE_EXTENSIONS, this.type);
    config.registerTargetVersionForType(this.name, OPTIONS, this.type);
  }
};