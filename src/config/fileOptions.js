// @flow

'use strict';

type FileOptions = {
  buildFactory: (string, string) => Build,
  fileCache: FileCache,
  fileExtensions: { [string]: Array<string> },
  fileFactory: (string, FileOptions) => File,
  level: number,
  npmModulepaths: Array<string>,
  resolverCache: ResolverCache,
  runtimeOptions: RuntimeOptions,
  sourceroot: string,
  webroot: string
};
