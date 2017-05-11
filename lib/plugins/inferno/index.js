'use strict';

const FILE_EXTENSIONS = ['jsx'];
const PLUGINS = [
  'babel-plugin-syntax-jsx',
  'babel-plugin-transform-react-display-name',
  'babel-plugin-inferno'
];

module.exports = {
  name: 'inferno',
  type: 'js',

  /**
   * Register plugin
   * @param {Config} config
   */
  register(config) {
    config.registerTargetVersionForType(this.name, PLUGINS, this.type);
    config.registerFileDefinitionAndExtensionsForType((JSFile, utils) => JSFile, FILE_EXTENSIONS, this.type);
  }
};
