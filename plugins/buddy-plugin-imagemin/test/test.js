'use strict';

const compressor = require('../index')
  , expect = require('expect.js')
  , fs = require('fs')
  , path = require('path');

describe('buddy-plugin-imagemin', () => {
  before(() => {
    process.chdir('./test/fixtures');
  });

  it('should compress jpg content', (done) => {
    compressor.compress(fs.readFileSync(path.resolve('pope.jpg')), null, (err, content) => {
      expect(content).to.have.length(74456);
      done();
    });
  });
  it('should compress png content', (done) => {
    compressor.compress(fs.readFileSync(path.resolve('pope.png')), null, (err, content) => {
      expect(content).to.have.length(125183);
      done();
    });
  });
  it('should compress gif content', (done) => {
    compressor.compress(fs.readFileSync(path.resolve('pope.gif')), null, (err, content) => {
      expect(content).to.have.length(59622);
      done();
    });
  });
  it('should compress svg content', (done) => {
    const filecontent = fs.readFileSync(path.resolve('foo.svg'), 'utf8');

    compressor.compress(filecontent, null, (err, content) => {
      expect(content).to.not.equal(filecontent);
      done();
    });
  });
});