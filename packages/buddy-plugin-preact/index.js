'use strict';

const FILE_EXTENSIONS = ['jsx'];
const PLUGINS = [
  ['babel-plugin-transform-react-jsx', { pragma: 'h' }]
];

module.exports = {
  name: 'preact',
  type: 'js',

  /**
   * Register plugin
   * @param {Config} config
   */
  register(config) {
    config.registerTargetVersionForType(this.name, this.type, PLUGINS);
    config.registerFileDefinitionAndExtensionsForType((JSFile, utils) => JSFile, FILE_EXTENSIONS, this.type);
  }
};
