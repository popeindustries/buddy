'use strict';

const cache = require('../../../lib/cache');
const configFactory = require('../../../lib/config');
const expect = require('expect.js');
const fs = require('fs');
const path = require('path');
const plugin = require('../index');
let config, file, fileFactoryOptions;

describe('buddy-plugin-typescript', () => {
  before(() => {
    process.chdir(path.resolve(__dirname, 'fixtures'));
  });
  beforeEach(() => {
    const caches = cache.createCaches();

    config = configFactory({
      input: '.',
      output: 'js'
    }, {});
    plugin.register(config);
    fileFactoryOptions = {
      fileCache: caches.fileCache,
      fileExtensions: config.fileExtensions,
      fileFactory: config.fileFactory,
      pluginOptions: { babel: { plugins: [] } },
      resolverCache: caches.resolverCache,
      runtimeOptions: config.runtimeOptions
    };
  });
  afterEach(() => {
    config.destroy();
  });

  describe('compile()', () => {
    it('should convert file content to JS', (done) => {
      file = config.fileFactory(path.resolve('a.ts'), fileFactoryOptions);
      file.compile({}, (err) => {
        expect(file.content).to.eql(fs.readFileSync(path.resolve('compiled/a.js'), 'utf8'));
        done();
      });
    });
    it.skip('should return an error when compiling a malformed file', (done) => {
      file = config.fileFactory(path.resolve('a-bad.ts'), fileFactoryOptions);
      file.compile({}, (err) => {
        expect(err).to.be.an(Error);
        done();
      });
    });
  });
});