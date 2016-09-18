'use strict';

const FILE_EXTENSIONS = ['jsx'];
const PLUGINS = [
  'babel-plugin-syntax-jsx',
  'babel-plugin-transform-react-display-name',
  'babel-plugin-transform-react-jsx'
];

module.exports = {
  name: 'react',
  type: 'js',

  /**
   * Register plugin
   * @param {Config} config
   */
  register (config) {
    config.registerFileExtensionsForType(FILE_EXTENSIONS, this.type);
    config.registerTargetVersionForType(this.name, PLUGINS, this.type);
  }
};