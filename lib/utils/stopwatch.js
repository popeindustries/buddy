'use strict';

let timers = {};

module.exports = {
  start,
  pause,
  stop,
  clear
};

/**
 * Start timer with 'id'
 * @param {String} id
 */
function start (id) {
  if (!timers[id]) {
    timers[id] = {
      start: 0,
      elapsed: 0
    };
  }
  timers[id].start = process.hrtime();
}

/**
 * Pause timer with 'id'
 * @param {String} id
 * @returns {null}
 */
function pause (id) {
  if (!timers[id]) return start(id);

  timers[id].elapsed += msDiff(process.hrtime(), timers[id].start);
}

/**
 * Stop timer with 'id' and return elapsed
 * @param {String} id
 * @returns {Number}
 */
function stop (id) {
  timers[id].elapsed += msDiff(process.hrtime(), timers[id].start);
  clear(id);
  return timers[id].elapsed;
}

/**
 * clear timer with 'id'
 * @param {String} id
 */
function clear (id) {
  delete timers[id];
}

/**
 * Retrieve difference in ms
 * @param {Array} t1
 * @param {Array} t2
 * @returns {Number}
 */
function msDiff (t1, t2) {
  t1 = (t1[0] * 1e9 + t1[1]) / 1e6;
  t2 = (t2[0] * 1e9 + t2[1]) / 1e6;
  return Math.ceil((t1 - t2) * 100) / 100;
}