'use strict';

const OPTIONS = {
  plugins: [
    require('babel-plugin-syntax-flow'),
    // Experimental, but needed for type syntax in Class constructors
    require('babel-plugin-transform-class-properties'),
    require('babel-plugin-transform-flow-strip-types')
  ]
};

module.exports = {
  name: 'flow',
  type: 'js',

  /**
   * Register plugin
   * @param {Config} config
   */
  register (config) {
    config.registerTargetVersionForType(this.name, OPTIONS, this.type);
  }
};