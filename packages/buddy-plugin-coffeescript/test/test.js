'use strict';

const buddyFactory = require('../../../lib/buddy');
const expect = require('expect.js');
const fs = require('fs');
const path = require('path');
const plugin = require('../index');
const rimraf = require('rimraf');
let buddy;

describe('buddy-plugin-coffeescript', () => {
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
        input: 'foo.coffee',
        output: 'output'
      }, { plugins: [plugin] });
      buddy.build((err, filepaths) => {
        expect(fs.existsSync(filepaths[0])).to.be(true);
        const content = fs.readFileSync(filepaths[0], 'utf8');

        expect(content).to.contain('(function () {\n/*== foo.coffee ==*/\n$m[\'foo\'] = { exports: {} };\nvar foo__foo = \'foo\';\n/*≠≠ foo.coffee ≠≠*/\n})()');
        done();
      });
    });
    it('should build a file and source map', (done) => {
      buddy = buddyFactory({
        input: 'foo.coffee',
        output: 'output'
      }, { maps: true, plugins: [plugin] });
      buddy.build((err, filepaths) => {
        expect(fs.existsSync(filepaths[0])).to.be(true);
        const content = fs.readFileSync(filepaths[0], 'utf8');
        const map = JSON.parse(fs.readFileSync(`${filepaths[0]}.map`, 'utf8'));

        expect(content).to.contain('(function () {\n/*== foo.coffee ==*/\n$m[\'foo\'] = { exports: {} };\nvar foo__foo = \'foo\';\n/*≠≠ foo.coffee ≠≠*/\n})()');
        expect(map).to.have.property('mappings', ';;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;AAAA,IAAA,WAAM');
        done();
      });
    });
    it('should error when compiling a malformed file', (done) => {
      buddy = buddyFactory({
        input: 'foo-bad.coffee',
        output: 'output'
      }, { plugins: [plugin] });
      buddy.build((err, filepaths) => {
        expect(err).to.be.an(Error);
        done();
      });
    });
  });
});