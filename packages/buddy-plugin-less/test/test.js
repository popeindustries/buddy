'use strict';

const buddyFactory = require('../../../lib/buddy');
const expect = require('expect.js');
const fs = require('fs');
const path = require('path');
const plugin = require('../index');
const rimraf = require('rimraf');
let buddy;

describe('buddy-plugin-less', () => {
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

  describe('compile()', () => {
    it('should build a file', (done) => {
      buddy = buddyFactory({
        input: 'foo.less',
        output: 'output'
      }, { plugins: [plugin] });
      buddy.build((err, filepaths) => {
        expect(fs.existsSync(filepaths[0])).to.be(true);
        const content = fs.readFileSync(filepaths[0], 'utf8');

        expect(content).to.contain('#header {\n  color: #333333;\n  border-left: 1px;\n  border-right: 2px;\n}\n#footer {\n  color: #114411;\n  border-color: #7d2717;\n}\n');
        done();
      });
    });
    it('should error when compiling a malformed file', (done) => {
      buddy = buddyFactory({
        input: 'foo-bad.less',
        output: 'output'
      }, { plugins: [plugin] });
      buddy.build((err, filepaths) => {
        expect(err).to.be.an(Error);
        done();
      });
    });
  });
});