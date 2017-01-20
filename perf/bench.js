'use strict';

const chalk = require('chalk');
const stopwatch = require('../lib/utils/stopwatch');

const RUNS = 5;
let runs = 0;

/**
 * Benchmark 'fn' with 'name'
 * @param {String} name
 * @param {Object} test
 */
module.exports = function bench (name, test) {
  console.log(`  benchmarking: ${chalk.yellow(name)}`);

  let times = [];

  run(name, test, times, () => {
    const total = times.reduce((total, time, idx) => {
      if (idx) total += time;
      return total;
    }, 0);

    console.log(`    mean: ${chalk.green(total / (times.length - 1) + 'ms')}`);
  });
};

function run (name, test, times, done) {
  test.before(() => {
    stopwatch.start(name + runs);
    test.run(() => {
      times.push(stopwatch.stop(name + runs));
      test.after(() => {
        if (++runs == RUNS) return done();
        run(name, test, times, done);
      });
    });
  });
}