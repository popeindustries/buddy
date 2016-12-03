'use strict';

const cache = require('../../../lib/cache');
const configFactory = require('../../../lib/config');
const expect = require('expect.js');
const fs = require('fs');
const path = require('path');
const plugin = require('../index');
let config, file, fileFactoryOptions;

describe('buddy-plugin-dust', () => {
  before(() => {
    process.chdir(path.resolve(__dirname, 'fixtures'));
  });
  beforeEach(() => {
    const caches = cache.createCaches();

    config = configFactory({
      input: '.',
      output: 'html'
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

  it('should convert file content to HTML', (done) => {
    file = config.fileFactory(path.resolve('a.dust'), fileFactoryOptions);
    file.parse({}, (err) => {
      file.compile({}, (err) => {
        expect(file.content).to.eql(fs.readFileSync(path.resolve('compiled/a.html'), 'utf8'));
        done();
      });
    });
  });
  it('should convert file content with includes to HTML', (done) => {
    file = config.fileFactory(path.resolve('a-include.dust'), fileFactoryOptions);
    file.parse({}, (err) => {
      file.inline({}, (err) => {
        file.compile({}, (err) => {
          expect(file.content).to.eql(fs.readFileSync(path.resolve('compiled/a-include.html'), 'utf8'));
          done();
        });
      });
    });
  });
});