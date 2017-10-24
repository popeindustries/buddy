'use strict';

const { expect } = require('chai');
const buddyFactory = require('../../../lib/buddy');
const fs = require('fs');
const path = require('path');
const plugin = require('../index');
const rimraf = require('rimraf');

let buddy;

describe('buddy-plugin-react', () => {
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

  it('should compile jsx', (done) => {
    buddy = buddyFactory({
      input: 'foo.jsx',
      output: 'output',
      version: 'react'
    }, { plugins: [plugin] });
    buddy.build((err, filepaths) => {
      expect(fs.existsSync(filepaths[0])).to.be(true);
      const content = fs.readFileSync(filepaths[0], 'utf8');

      expect(content).to.contain("React.createElement(");
      done();
    });
  });
});