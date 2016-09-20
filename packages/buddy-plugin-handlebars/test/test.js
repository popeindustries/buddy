'use strict';

const configFactory = require('../../../lib/config');
const expect = require('expect.js');
const path = require('path');
const plugin = require('../index');
const fs = require('fs');
let config, file, fileFactoryOptions;

describe('buddy-plugin-handlebars', () => {
  before(() => {
    process.chdir(path.resolve(__dirname, 'fixtures'));
  });
  beforeEach(() => {
    config = configFactory({
      input: '.',
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
    file = config.fileFactory(path.resolve('a.handlebars'), fileFactoryOptions);
    file.parse({}, (err) => {
      file.compile({}, (err) => {
        expect(file.content).to.eql(fs.readFileSync(path.resolve('compiled/a.html'), 'utf8'));
        done();
      });
    });
  });
  it('should return an error when compiling a malformed file', (done) => {
    file = config.fileFactory(path.resolve('bad.handlebars'), fileFactoryOptions);
    file.parse({}, (err) => {
      file.compile({}, (err) => {
        expect(err).to.be.an(Error);
        done();
      });
    });
  });
});