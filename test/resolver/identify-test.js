'use strict';

const { createCaches } = require('../../lib/cache');
const { expect } = require('chai');
const config = require('../../lib/resolver/config');
const identify = require('../../lib/resolver/identify');
const path = require('path');

let cache;

describe('resolver:identify', () => {
  before(() => {
    cache = createCaches().resolverCache;
    process.chdir(path.resolve(__dirname, 'fixtures'));
  });
  afterEach(() => {
    cache.clear(true);
  });

  it('should not resolve a missing filepath', () => {
    expect(identify('blah')).to.equal('');
  });
  it('should not resolve a relative filepath', () => {
    expect(identify('./foo.js')).to.equal('');
  });
  it('should resolve an ID for a filepath in the default source directory', () => {
    expect(identify(path.resolve('foo.js'))).to.equal('index');
  });
  it('should resolve an ID for a filepath nested in the default source directory', () => {
    expect(identify(path.resolve('nested/bar.js'))).to.equal('nested/bar');
  });
  it('should resolve an ID for a package module with missing manifest', () => {
    expect(identify(path.resolve('node_modules/bar/index.js'))).to.equal('bar/index');
  });
  it('should resolve an ID for a nested package module with missing manifest', () => {
    expect(identify(path.resolve('node_modules/bar/node_modules/bat/index.js'))).to.equal('bat/index');
  });
  it('should resolve an ID for a package module', () => {
    expect(identify(path.resolve('node_modules/foo/lib/bat.js'))).to.equal('foo');
  });
  it('should resolve an ID for a package module filepath', () => {
    expect(identify(path.resolve('node_modules/foo/lib/bar.js'))).to.equal('foo/lib/bar');
  });
  it('should resolve an ID for a package main filepath with "browser" alias', () => {
    expect(identify(path.resolve('index.js'))).to.equal('project');
  });
  it('should resolve separate IDs for different versions of the same package', () => {
    const c = config();

    expect(identify(path.resolve('node_modules/baz/node_modules/foo/lib/bat.js'), c)).to.equal('foo');
    expect(identify(path.resolve('node_modules/foo/lib/bat.js'), c)).to.equal('foo#1.0.0');
  });
  it('should resolve an ID for a scoped package module', () => {
    expect(identify(path.resolve('node_modules/@popeindustries/test/test.js'))).to.equal('@popeindustries/test');
    expect(identify(path.resolve('node_modules/@popeindustries/test/node_modules/foo/lib/bat.js'))).to.equal('foo');
  });
  it('should resolve an ID for a scoped package module filepath', () => {
    expect(identify(path.resolve('node_modules/@popeindustries/test/lib/bar.js'))).to.equal(
      '@popeindustries/test/lib/bar'
    );
  });
  it('should resolve an ID for a filepath with multiple "."', () => {
    expect(identify(path.resolve('foo.bar.js'))).to.equal('foo.bar');
  });
  it('should resolve an ID for an aliased filepath', () => {
    expect(identify(path.resolve('node_modules/browser2/browser/foo.js'))).to.equal('index');
  });
  it('should not resolve an ID for a disabled filepath', () => {
    expect(identify(path.resolve('node_modules/browser2/bar.js'))).to.equal('browser2/bar');
  });
});
