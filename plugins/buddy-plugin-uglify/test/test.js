'use strict';

const compress = require('..').compress;
const expect = require('expect.js');
const fs = require('fs');
const path = require('path');
let options;

describe('buddy-plugin-uglify', () => {
  before(() => {
    process.chdir('./test/fixtures');
  });
  beforeEach(() => {
    options = {};
  });

  it('should preserve special comments', (done) => {
    compress(fs.readFileSync(path.resolve('foo.js'), 'utf8'), options, (err, content) => {
      expect(err).to.be(null);
      expect(content).to.eql('/**\n * foo\n * https://github.com/foo\n * @copyright foo\n * @license MIT\n */\n"use strict";module.exports="foo";');
      done();
    });
  });
});