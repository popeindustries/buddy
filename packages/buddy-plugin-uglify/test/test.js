'use strict';

const configFactory = require('../../../lib/config');
const expect = require('expect.js');
const path = require('path');
const plugin = require('../index');
let config, file, fileFactoryOptions;

describe('buddy-plugin-uglify', () => {
  before(() => {
    process.chdir(path.resolve(__dirname, 'fixtures'));
  });
  beforeEach(() => {
    config = configFactory({
      input: '.',
      output: 'js'
    }, {});
    plugin.register(config);
    fileFactoryOptions = {
      caches: config.caches,
      fileExtensions: config.fileExtensions,
      fileFactory: config.fileFactory,
      pluginOptions: { babel: { plugins: [] } },
      runtimeOptions: config.runtimeOptions,
      sources: [path.resolve('.')]
    };
  });
  afterEach(() => {
    config.destroy();
  });

  it('should preserve special comments', (done) => {
    file = config.fileFactory(path.resolve('a.js'), fileFactoryOptions);
    file.compress({ compress: true }, (err) => {
      expect(file.content).to.eql('/**\n * foo\n * https://github.com/foo\n * @copyright foo\n * @license MIT\n */\n"use strict";module.exports="foo";');
      done();
    });
  });
});