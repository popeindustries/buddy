'use strict';

const bench = require('./bench');
const configFactory = require('../lib/config');
const path = require('path');

let config;

const test = {
  before (done) {
    done();
  },

  run (done) {
    config = configFactory(path.resolve('./fixtures'), {});
    done();
  },

  after (done) {
    config.destroy();
    config = null;
    done();
  }
};

bench('config', test);