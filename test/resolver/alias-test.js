'use strict';

const { createCaches } = require('../../lib/cache');
const { expect } = require('chai');
const alias = require('../../lib/resolver/alias');
const path = require('path');

let cache;

describe('resolver:alias', () => {
  before(() => {
    cache = createCaches().resolverCache;
    process.chdir(path.resolve(__dirname, 'fixtures'));
  });
  afterEach(() => {
    cache.clear(true);
  });

  describe('parse()', () => {
    it('should parse relative paths', () => {
      const aliases = alias.parse(process.cwd(), { './index.js': './foo.js' });

      expect(aliases).to.have.property(path.resolve('index.js'), path.resolve('foo.js'));
      expect(Object.keys(aliases)).to.have.length(1);
    });
    it('should parse disabled', () => {
      const aliases = alias.parse(process.cwd(), { foo: false });

      expect(aliases).to.have.property('foo', false);
      expect(Object.keys(aliases)).to.have.length(1);
    });
  });

  describe('resolve()', () => {
    it('should resolve a filepath', () => {
      expect(alias.resolve(path.resolve('index.js'), { [path.resolve('index.js')]: path.resolve('foo.js') })).to.equal(
        path.resolve('foo.js')
      );
    });
    it('should resolve a package id', () => {
      expect(alias.resolve('foo', { foo: path.resolve('foo.js') })).to.equal(path.resolve('foo.js'));
    });
    it('should resolve a scoped package id', () => {
      expect(alias.resolve('@foo/bar', { '@foo/bar': path.resolve('foo.js') })).to.equal(path.resolve('foo.js'));
    });
    it('should resolve a disabled package', () => {
      expect(alias.resolve('foo', { foo: false })).to.equal(false);
    });
    it('should resolve a file in a disabled package', () => {
      expect(alias.resolve('foo/bar', { foo: false })).to.equal(false);
    });
    it('should resolve a file in a disabled scoped package', () => {
      expect(alias.resolve('@foo/bar/boo', { '@foo/bar': false })).to.equal(false);
    });
  });
});
