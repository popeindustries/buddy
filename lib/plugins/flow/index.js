'use strict';

const PLUGINS = [
  'babel-plugin-syntax-flow',
  // Experimental, but needed for type syntax in Class constructors
  'babel-plugin-transform-class-properties',
  'babel-plugin-transform-flow-strip-types'
];

module.exports = {
  name: 'flow',
  type: 'js',

  /**
   * Register plugin
   * @param {Config} config
   */
  register (config) {
    config.registerTargetVersionForType(this.name, PLUGINS, this.type);
  }
};