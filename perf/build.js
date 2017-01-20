'use strict';

const bench = require('./bench');
const buddyFactory = require('../lib/buddy');
const path = require('path');
const rimraf = require('rimraf');

let buddy;

const test = {
  before (done) {
    buddy = buddyFactory({
      input: path.resolve(__dirname, './fixtures/babel.js'),
      output: path.resolve(__dirname, 'output'),
      version: 'node'
    });
    done();
  },

  run (done) {
    buddy.build(done);
  },

  after (done) {
    buddy.destroy();
    buddy = null;
    rimraf.sync(path.resolve(__dirname, 'output'));
    done();
  }
};

bench('build', test);