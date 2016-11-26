'use strict';

const cache = require('../../../lib/cache');
const configFactory = require('../../../lib/config');
const expect = require('expect.js');
const fs = require('fs');
const path = require('path');
const plugin = require('../index');
let config, file, fileFactoryOptions;

describe('buddy-plugin-coffeescript', () => {
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
      fileCache: cache.createFileCache(),
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

  describe('compile()', () => {
    it('should convert file content to JS', (done) => {
      file = config.fileFactory(path.resolve('a.coffee'), fileFactoryOptions);
      file.compile({}, (err) => {
        expect(file.string.toString()).to.eql(fs.readFileSync(path.resolve('compiled/a.js'), 'utf8'));
        done();
      });
    });
    it('should return an error when compiling a malformed file', (done) => {
      file = config.fileFactory(path.resolve('a-bad.coffee'), fileFactoryOptions);
      file.compile({}, (err) => {
        expect(err).to.be.an(Error);
        done();
      });
    });
  });
});