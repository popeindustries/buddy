// @flow

'use strict';

const { isUndefined } = require('./is');

const timers = {};

module.exports = {
  start,
  pause,
  stop,
  clear,
  msDiff
};

/**
 * Start timer with 'id'
 */
function start(id: string) {
  if (isUndefined(timers[id])) {
    timers[id] = {
      start: 0,
      elapsed: 0
    };
  }
  timers[id].start = process.hrtime();
}

/**
 * Pause timer with 'id'
 */
function pause(id: string) {
  if (isUndefined(timers[id])) {
    return void start(id);
  }

  timers[id].elapsed += msDiff(process.hrtime(), timers[id].start);
}

/**
 * Stop timer with 'id' and return elapsed
 */
function stop(id: string, formatted: boolean): number | string {
  const elapsed = timers[id].elapsed + msDiff(process.hrtime(), timers[id].start);

  clear(id);
  return formatted ? format(elapsed) : elapsed;
}

/**
 * clear timer with 'id'
 * @param {String} id
 */
function clear(id: string) {
  delete timers[id];
}

/**
 * Retrieve difference in ms
 */
function msDiff(t1: [number, number], t2: [number, number]): number {
  const t1Num = (t1[0] * 1e9 + t1[1]) / 1e6;
  const t2Num = (t2[0] * 1e9 + t2[1]) / 1e6;

  return Math.ceil((t1Num - t2Num) * 100) / 100;
}

/**
 * Format 't'
 */
function format(t: number): string {
  if (t < 1000) {
    return `${Math.round(t)}ms`;
  }
  return `${Math.floor(t / 1000 * 100) / 100}s`;
}
