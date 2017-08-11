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
  register(config) {
    config.registerTargetVersionForType(this.name, PLUGINS, this.type);
    config.registerFileDefinitionAndExtensionsForType(define, FILE_EXTENSIONS, this.type);
  }
};

/**
 * Extend 'JSFile' with new behaviour
 * @param {Class} JSFile
 * @param {Object} utils
 * @returns {Class}
 */
function define(JSFile, utils) {
  return class JSXFile extends JSFile {
    /**
     * Parse 'content' for dependency references
     * @param {String} content
     * @returns {Array}
     */
    parseDependencyReferences(content) {
      const references = super.parseDependencyReferences(content);

      references[0].push({ context: "require('react')", match: 'react', id: 'react' });

      return references;
    }

    /**
     * Transpile file contents
     * @param {Object} buildOptions
     *  - {Boolean} batch
     *  - {Boolean} bootstrap
     *  - {Boolean} boilerplate
     *  - {Boolean} browser
     *  - {Boolean} bundle
     *  - {Boolean} compress
     *  - {Boolean} helpers
     *  - {Array} ignoredFiles
     *  - {Boolean} import
     *  - {Boolean} watchOnly
     * @param {Function} fn(err)
     */
    transpile(buildOptions, fn) {
      super.transpile(buildOptions, (err) => {
        if (err) return fn && fn();
        this.prependContent("var React = $m['react'].exports;");
        fn();
      });
    }
  };
}
