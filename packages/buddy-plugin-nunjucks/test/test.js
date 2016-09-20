'use strict';

const configFactory = require('../../../lib/config');
const expect = require('expect.js');
const path = require('path');
const plugin = require('../index');
const fs = require('fs');
let config, file, fileFactoryOptions;

describe('buddy-plugin-nunjucks', () => {
  before(() => {
    process.chdir('./test/fixtures');
  });
  beforeEach(() => {
    config = configFactory({
      input: 'foo.nunjs',
      output: 'html'
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

  it('should convert file content to HTML', (done) => {
    file = config.fileFactory(path.resolve('foo.nunjs'), fileFactoryOptions);
    file.parse({}, (err) => {
      file.compile({}, (err) => {
        expect(file.content).to.eql(fs.readFileSync(path.resolve('compiled/foo.html'), 'utf8'));
        done();
      });
    });
  });
  it('should convert file content with includes to HTML', (done) => {
    file = config.fileFactory(path.resolve('foo-include.nunjs'), fileFactoryOptions);
    file.parse({}, (err) => {
      file.compile({}, (err) => {
        expect(file.content).to.eql(fs.readFileSync(path.resolve('compiled/foo-include.html'), 'utf8'));
        done();
      });
    });
  });
});