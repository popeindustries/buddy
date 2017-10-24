const { expect } = require('chai');
const buddyFactory = require('../../lib/buddy');
const fs = require('fs');
const path = require('path');
const rimraf = require('rimraf');

let buddy;

describe('IMG', () => {
  before(() => {
    process.chdir(path.resolve(__dirname, 'fixtures/buddy/build'));
  });
  beforeEach(() => {
    buddy = null;
    process.env.NODE_ENV = 'test';
  });
  afterEach(() => {
    if (buddy) buddy.destroy();
    rimraf.sync(path.resolve('output'));
  });
  after(() => {
    ['yarn.lock', 'node_modules', 'package.json'].forEach(p => {
      if (fs.existsSync(path.resolve(p))) rimraf.sync(path.resolve(p));
    });
  });

  it('should copy an image directory', done => {
    buddy = buddyFactory({
      input: 'image-directory',
      output: 'output'
    });
    buddy.build((err, filepaths) => {
      expect(filepaths).to.have.length(2);
      expect(fs.existsSync(filepaths[0])).to.be(true);
      done();
    });
  });
});
