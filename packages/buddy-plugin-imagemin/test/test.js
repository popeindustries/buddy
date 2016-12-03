'use strict';

const cache = require('../../../lib/cache');
const configFactory = require('../../../lib/config');
const expect = require('expect.js');
const path = require('path');
const plugin = require('../index');
let config, file, fileFactoryOptions;

describe('buddy-plugin-imagemin', () => {
  before(() => {
    process.chdir(path.resolve(__dirname, 'fixtures'));
  });
  beforeEach(() => {
    const caches = cache.createCaches();

    config = configFactory({
      input: '.',
      output: 'img'
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

  it('should compress jpg content', (done) => {
    file = config.fileFactory(path.resolve('a.jpg'), fileFactoryOptions);
    file.compress({ compress: true }, (err) => {
      expect(file.content).to.have.length(74456);
      done();
    });
  });
  it('should compress png content', (done) => {
    file = config.fileFactory(path.resolve('a.png'), fileFactoryOptions);
    file.compress({ compress: true }, (err) => {
      expect(file.content).to.have.length(125183);
      done();
    });
  });
  it('should compress gif content', (done) => {
    file = config.fileFactory(path.resolve('a.gif'), fileFactoryOptions);
    file.compress({ compress: true }, (err) => {
      expect(file.content).to.have.length(59622);
      done();
    });
  });
  it('should compress svg content', (done) => {
    file = config.fileFactory(path.resolve('a.svg'), fileFactoryOptions);
    file.compress({ compress: true }, (err) => {
      expect(file.content).to.not.equal(file.fileContent);
      done();
    });
  });
});