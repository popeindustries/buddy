'use strict';

const { expect } = require('chai');
const buddyFactory = require('../../../lib/buddy');
const fs = require('fs');
const path = require('path');
const plugin = require('../index');
const rimraf = require('rimraf');

let buddy;

describe('buddy-plugin-stylus', () => {
  before(() => {
    process.chdir(path.resolve(__dirname, 'fixtures'));
  });
  beforeEach(() => {
    buddy = null;
  });
  afterEach(() => {
    if (buddy) buddy.destroy();
    rimraf.sync(path.resolve('output'));
  });

  it('should build a minified stylus file if "compress" is true', (done) => {
    buddy = buddyFactory({
      input: 'foo.styl',
      output: 'output'
    }, { compress: true, plugins: [plugin] });
    buddy.build((err, filepaths) => {
      expect(filepaths).to.have.length(1);
      expect(fs.existsSync(filepaths[0])).to.be(true);
      const content = fs.readFileSync(filepaths[0], 'utf8');

      expect(content).to.contain('body{color:#fff;font-size:12px}body p{font-size:10px}');
      done();
    });
  });
  it('should error when compiling a malformed file', (done) => {
    buddy = buddyFactory({
      input: 'foo-bad.styl',
      output: 'output'
    }, { plugins: [plugin] });
    buddy.build((err, filepaths) => {
      expect(err).to.be.an(Error);
      done();
    });
  });
});