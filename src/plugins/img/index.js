// @flow

'use strict';

import typeof File from '../../File';

const { debug, strong } = require('../../utils/cnsl');

const FILE_EXTENSIONS = ['gif', 'jpg', 'jpeg', 'png', 'svg'];
const WORKFLOW_WRITEABLE = ['compress:compress'];

module.exports = {
  name: 'img',
  type: 'img',

  /**
   * Register plugin
   */
  register(config: Config) {
    config.registerFileDefinitionAndExtensionsForType(define, FILE_EXTENSIONS, this.type);
  }
};

/**
 * Extend 'File' with new behaviour
 * @param {Class} File
 * @param {Object} utils
 * @returns {Class}
 */
function define(File: File, utils: Object): IMGFile {
  return class IMGFile extends File {
    constructor(id: string, filepath: string, options: FileOptions) {
      super(id, filepath, 'img', options);

      this.hasMaps = false;
      this.workflows.writeable = WORKFLOW_WRITEABLE;
    }

    /**
     * Read and store file contents
     */
    load(buildOptions: BuildOptions, fn: (?Error) => void) {
      // Make sure to load as Buffer
      if (this.extension !== 'svg') {
        this.encoding = null;
      }
      super.load(buildOptions, fn);
    }

    /**
     * Parse file contents for dependency references [no-op]
     */
    parse(buildOptions: BuildOptions, fn: (?Error) => void) {
      debug(`parse: ${strong(this.relpath)}`, 4);
      fn();
    }
  };
}
