'use strict';

const configFactory = require('../../../lib/config');
const expect = require('expect.js');
const path = require('path');
const plugin = require('../index');
const fs = require('fs');
let config, file, fileFactoryOptions;

describe('buddy-plugin-less', () => {
  before(() => {
    process.chdir('./test/fixtures');
  });
  beforeEach(() => {
    config = configFactory({
      input: 'foo.styl',
      output: 'css'
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

  describe('compile()', () => {
    it('should convert file content to CSS', (done) => {
      file = config.fileFactory(path.resolve('foo.less'), fileFactoryOptions);
      file.compile({}, (err) => {
        expect(file.content).to.eql(fs.readFileSync(path.resolve('compiled/foo.css'), 'utf8'));
        done();
      });
    });
    it('should return an error when compiling a malformed file', (done) => {
      file = config.fileFactory(path.resolve('foo-bad.less'), fileFactoryOptions);
      file.compile({}, (err) => {
        expect(err).to.be.an(Error);
        done();
      });
    });
  });
});