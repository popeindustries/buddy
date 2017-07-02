// @flow

'use strict';

import typeof File from '../../File';

const { debug, strong } = require('../../utils/cnsl');

const FILE_EXTENSIONS = ['json'];
const WORKFLOW_STANDARD = ['load'];

module.exports = {
  name: 'json',
  type: 'json',

  /**
   * Register plugin
   */
  register(config: Config) {
    // Allow json files to be parsed as js also
    config.registerFileExtensionsForType(FILE_EXTENSIONS, 'js');
    config.registerFileDefinitionAndExtensionsForType(define, FILE_EXTENSIONS, this.type);
  }
};

/**
 * Extend 'File' with new behaviour
 */
function define(File: File, utils: Object): JSONFile {
  return class JSONFile extends File {
    constructor(id: string, filepath: string, options: FileOptions) {
      super(id, filepath, 'json', options);

      this.hasMaps = false;
      this.workflows.standard = WORKFLOW_STANDARD;
      // No processing required
      this.workflows.inlineable = [];
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
