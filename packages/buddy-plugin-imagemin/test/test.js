'use strict';

const buddyFactory = require('../../../lib/buddy');
const expect = require('expect.js');
const fs = require('fs');
const path = require('path');
const plugin = require('../index');
const rimraf = require('rimraf');
let buddy;

describe('buddy-plugin-imagemin', () => {
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

  it('should compress and copy an image directory', (done) => {
    buddy = buddyFactory({
      input: '.',
      output: 'output'
    }, { compress: true, plugins: [plugin] });
    buddy.build((err, filepaths) => {
      expect(filepaths).to.have.length(4);
      expect(fs.existsSync(filepaths[0])).to.be(true);
      expect(fs.readFileSync(filepaths[3], 'utf8')).to.eql('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="25"/></svg>');
      done();
    });
  });
  it('should compress jpg content', (done) => {
    buddy = buddyFactory({
      input: 'a.jpg',
      output: 'output'
    }, { compress: true, plugins: [plugin] });
    buddy.build((err, filepaths) => {
      expect(fs.readFileSync(filepaths[0])).to.have.length(74456);
      done();
    });
  });
  it('should compress png content', (done) => {
    buddy = buddyFactory({
      input: 'a.png',
      output: 'output'
    }, { compress: true, plugins: [plugin] });
    buddy.build((err, filepaths) => {
      expect(fs.readFileSync(filepaths[0])).to.have.length(125183);
      done();
    });
  });
  it('should compress gif content', (done) => {
    buddy = buddyFactory({
      input: 'a.gif',
      output: 'output'
    }, { compress: true, plugins: [plugin] });
    buddy.build((err, filepaths) => {
      expect(fs.readFileSync(filepaths[0])).to.have.length(59622);
      done();
    });
  });
  it('should compress svg content', (done) => {
    buddy = buddyFactory({
      input: 'a.svg',
      output: 'output'
    }, { compress: true, plugins: [plugin] });
    buddy.build((err, filepaths) => {
      expect(fs.readFileSync(filepaths[0], 'utf8')).to.equal('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="25"/></svg>');
      done();
    });
  });
});