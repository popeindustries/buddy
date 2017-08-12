'use strict';

const { createCaches } = require('../../lib/cache');
const { expect } = require('chai');
const { versionDelimiter } = require('../../lib/settings');
const path = require('path');

let cache;

describe('resolver:cache', () => {
  before(() => {
    cache = createCaches().resolverCache;
    process.chdir(path.resolve(__dirname, 'fixtures'));
  });
  afterEach(() => {
    cache.clear(true);
  });

  describe('caching a file', () => {
    it('should store a simple file', () => {
      cache.setFile({ path: '/foo/index.js', id: 'foo' }, versionDelimiter);
      expect(cache.getFile('/foo/index.js')).to.equal('foo');
    });
    it('should track versioned modules', () => {
      cache.setFile({ path: '/node_modules/foo/index.js', id: 'foo#1.0.0', version: '1.0.0' }, versionDelimiter);
      expect(cache.getFileVersions('foo#1.0.0', versionDelimiter)).to.have.length(1);
      cache.setFile(
        { path: '/node_modules/bar/node_modules/foo/index.js', id: 'foo#2.0.0', version: '2.0.0' },
        versionDelimiter
      );
      expect(cache.getFileVersions('foo#1.0.0', versionDelimiter)).to.have.length(2);
    });
  });
  describe('caching a package', () => {
    it('should store package details for a package path', () => {
      cache.setPackage({ name: 'foo', pkgpath: '/foo', version: '0.0.0', id: 'foo#0.0.0' });
      expect(cache.getPackage('/foo')).to.have.property('name', 'foo');
    });
  });
  describe('clearing', () => {
    it('should reset all internal caches', () => {
      cache.setFile({ path: '/foo/index.js', id: 'foo' }, versionDelimiter);
      cache.clear();
      expect(cache.getFile('/foo/index.js')).to.eql(undefined);
    });
  });
});
