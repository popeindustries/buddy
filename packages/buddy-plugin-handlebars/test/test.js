'use strict';

const { expect } = require('chai');
const buddyFactory = require('../../../lib/buddy');
const fs = require('fs');
const path = require('path');
const plugin = require('../index');
const rimraf = require('rimraf');

let buddy;

describe('buddy-plugin-handlebars', () => {
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

  it('should build a simple template file', (done) => {
    buddy = buddyFactory({
      input: 'foo.handlebars',
      output: 'output'
    }, { plugins: [plugin] });
    buddy.build((err, filepaths) => {
      expect(fs.existsSync(filepaths[0])).to.be(true);
      const content = fs.readFileSync(filepaths[0], 'utf8');

      expect(content).to.equal('<!DOCTYPE html>\n<html>\n  <body>\n    <h1>Title</h1>\n    <p>Test paragraph</p>\n  </body>\n</html>');
      done();
    });
  });
});