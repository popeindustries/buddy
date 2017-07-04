// @flow

'use strict';

import type { CallableUtils } from './callable';
import type { CnslUtils } from './cnsl';
import type { EnvUtils } from './env';
import type { FileUtils } from './file';
import type { FilepathUtils } from './filepath';
import type { IsUtils } from './is';
import type { SourceMapUtils } from './sourceMap';
import type { StopwatchUtils } from './stopwatch';
import type { StringUtils } from './string';
import type { TreeUtils } from './tree';
export type Utils = {
  callable: CallableUtils,
  cnsl: CnslUtils,
  env: EnvUtils,
  file: FileUtils,
  filepath: FilepathUtils,
  is: IsUtils,
  sourceMap: SourceMapUtils,
  stopwatch: StopwatchUtils,
  string: StringUtils,
  tree: TreeUtils
};

module.exports = {
  callable: require('./callable'),
  cnsl: require('./cnsl'),
  env: require('./env'),
  file: require('./file'),
  filepath: require('./filepath'),
  is: require('./is'),
  sourceMap: require('./sourceMap'),
  stopwatch: require('./stopwatch'),
  string: require('./string'),
  tree: require('./tree')
};
