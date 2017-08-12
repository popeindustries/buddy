'use strict';

const { expect } = require('chai');
const stopwatch = require('../../lib/utils/stopwatch');
const path = require('path');

describe('stopwatch', () => {
  before(() => {
    process.chdir(path.resolve(__dirname, 'fixtures'));
  });
  afterEach(() => {
    stopwatch.clear('test');
  });

  it('should start and stop with elapsed duration', done => {
    stopwatch.start('test');
    setTimeout(() => {
      const elapsed = stopwatch.stop('test');

      expect(elapsed).to.be.within(490, 510);
      done();
    }, 500);
  });
  it('should start and stop with formatted duration in ms', done => {
    stopwatch.start('test');
    setTimeout(() => {
      const elapsed = stopwatch.stop('test', true);

      expect(elapsed).to.match(/^5[0-9]{2}ms$/);
      done();
    }, 500);
  });
  it('should start and stop with formatted duration in s', done => {
    stopwatch.start('test');
    setTimeout(() => {
      const elapsed = stopwatch.stop('test', true);

      expect(elapsed).to.match(/^1\.[0-9]{1,2}s$/);
      done();
    }, 1100);
  });
});
