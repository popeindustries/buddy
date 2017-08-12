'use strict';

const { createCaches } = require('../../lib/cache');
const { expect } = require('chai');
const path = require('path');
const resolve = require('../../lib/resolver/resolve');

let cache;

describe('resolver:resolve', () => {
  before(() => {
    cache = createCaches().resolverCache;
    process.chdir(path.resolve(__dirname, 'fixtures'));
  });
  afterEach(() => {
    cache.clear(true);
  });

  it("should not resolve a file if the reference file doesn't exist", () => {
    expect(resolve(path.resolve('blah.js'), '')).to.equal('');
  });
  it('should resolve an absolute path', () => {
    expect(resolve(path.resolve('foo.js'), path.resolve('foo.js'))).to.equal(path.resolve('foo.js'));
  });
  it('should resolve a relative path to a js file in the same directory', () => {
    expect(resolve(path.resolve('foo.js'), './baz')).to.equal(path.resolve('baz.js'));
  });
  it('should resolve a relative path to a js file in a child directory', () => {
    expect(resolve(path.resolve('foo.js'), './nested/foo')).to.equal(path.resolve('nested/foo.js'));
  });
  it('should resolve a relative path to a js file in a parent directory', () => {
    expect(resolve(path.resolve('nested/foo.js'), '../baz')).to.equal(path.resolve('baz.js'));
  });
  it('should not resolve a js file with an unkown extension', () => {
    expect(resolve(path.resolve('foo.js'), './bar.blah')).to.equal('');
  });
  it('should resolve a js file with an unkown extension when optionally specified', () => {
    expect(resolve(path.resolve('foo.js'), './bar', { fileExtensions: { js: ['coffee'] } })).to.equal(
      path.resolve('bar.coffee')
    );
  });
  it('should resolve a file name containing multiple "."', () => {
    expect(resolve(path.resolve('foo.js'), './foo.bar')).to.equal(path.resolve('foo.bar.js'));
  });
  it('should resolve a js package module path containing a package.json file and a "main" file field', () => {
    expect(resolve(path.resolve('baz.js'), 'foo')).to.equal(path.resolve('node_modules/foo/lib/bat.js'));
  });
  it('should resolve a js package module path containing a package.json file and a "main" directory field', () => {
    expect(resolve(path.resolve('baz.js'), 'foo-dir')).to.equal(path.resolve('node_modules/foo-dir/lib/index.js'));
  });
  it('should resolve a js package module path from a deeply nested location', () => {
    expect(resolve(path.resolve('src/package/foo.js'), 'foo')).to.equal(path.resolve('node_modules/foo/lib/bat.js'));
  });
  it('should not resolve a sub-module of a js package module path from a deeply nested location', () => {
    expect(resolve(path.resolve('src/package/foo.js'), 'bar/bat')).to.equal('');
  });
  it('should resolve a js package module path with no package.json file', () => {
    expect(resolve(path.resolve('baz.js'), 'bar')).to.equal(path.resolve('node_modules/bar/index.js'));
  });
  it('should resolve a js package module source path', () => {
    expect(resolve(path.resolve('baz.js'), 'foo/lib/bat')).to.equal(path.resolve('node_modules/foo/lib/bat.js'));
  });
  it('should resolve a js package module path for a deeply nested package module', () => {
    expect(resolve(path.resolve('node_modules/bar/node_modules/bat/index.js'), 'foo')).to.equal(
      path.resolve('node_modules/foo/lib/bat.js')
    );
  });
  it('should resolve a js package module source path for a deeply nested package module', () => {
    expect(resolve(path.resolve('node_modules/bar/node_modules/bat/index.js'), 'foo/lib/bar')).to.equal(
      path.resolve('node_modules/foo/lib/bar.js')
    );
  });
  it('should resolve a scoped js package module path containing a package.json file and a "main" file field', () => {
    expect(resolve(path.resolve('baz.js'), '@popeindustries/test')).to.equal(
      path.resolve('node_modules/@popeindustries/test/test.js')
    );
  });
  it('should resolve a scoped js package module source path', () => {
    expect(resolve(path.resolve('baz.js'), '@popeindustries/test/lib/bar')).to.equal(
      path.resolve('node_modules/@popeindustries/test/lib/bar.js')
    );
  });
  it('should resolve an aliased main module file via simple "browser" field', () => {
    expect(resolve(path.resolve('baz.js'), 'browser')).to.equal(path.resolve('node_modules/browser/browser/foo.js'));
  });
  it('should resolve an aliased main file via "browser" hash', () => {
    expect(resolve(path.resolve('baz.js'), 'browser2')).to.equal(path.resolve('node_modules/browser2/browser/foo.js'));
  });
  it('should resolve an aliased id via "browser" hash', () => {
    expect(resolve(path.resolve('node_modules/browser2/foo.js'), 'index')).to.equal(
      path.resolve('node_modules/browser2/browser/foo.js')
    );
  });
  it('should resolve an aliased id via "browser" hash from a nested project package', () => {
    expect(resolve(path.resolve('nested/node_modules/boop/boop.js'), 'index')).to.equal(path.resolve('foo.js'));
  });
  it('should resolve a disabled package via "browser" hash', () => {
    expect(resolve(path.resolve('node_modules/browser2/foo.js'), 'bat')).to.equal(false);
  });
  it('should resolve an aliased package with multiple aliases via "browser" hash', () => {
    expect(resolve(path.resolve('node_modules/browser2/bar.js'), 'foo')).to.equal(
      path.resolve('node_modules/browser2/foo.js')
    );
  });
  it('should resolve an aliased package with a file via "browser" hash', () => {
    expect(resolve(path.resolve('node_modules/browser2/foo.js'), 'bar')).to.equal(
      path.resolve('node_modules/browser2/foo.js')
    );
  });
  it('should resolve a disabled file via "browser" hash', () => {
    expect(resolve(path.resolve('node_modules/browser2/foo.js'), './bar')).to.equal(false);
    expect(resolve(path.resolve('node_modules/browser2/foo.js'), './bar.js')).to.equal(false);
    expect(resolve(path.resolve('foo.js'), 'browser2/bar')).to.equal(false);
  });
  it('should resolve an aliased file with a package via "browser" hash', () => {
    expect(resolve(path.resolve('node_modules/browser2/foo.js'), './bing')).to.equal(
      path.resolve('node_modules/browser2/node_modules/bing/index.js')
    );
    expect(resolve(path.resolve('node_modules/browser2/foo.js'), './bing.js')).to.equal(
      path.resolve('node_modules/browser2/node_modules/bing/index.js')
    );
  });
  it('should resolve an aliased native module via a "browser" hash', () => {
    expect(resolve(path.resolve('node_modules/browser2/foo.js'), 'http')).to.equal(false);
    expect(resolve(path.resolve('node_modules/browser2/bar.js'), 'net')).to.equal(
      path.resolve('node_modules/browser2/foo.js')
    );
  });
  it('should resolve a native module reference', () => {
    expect(resolve(path.resolve('foo.js'), 'http')).to.equal(false);
  });
  it('should resolve root project main file with "browser" alias', () => {
    expect(resolve(path.resolve('foo.js'), 'project')).to.equal(path.resolve('index.js'));
  });
  it('should resolve cached aliased package file of same version', () => {
    expect(resolve(path.resolve('node_modules/foo/index.js'), 'boo/boo.js'), { js: ['js'] }).to.equal(
      path.resolve('node_modules/boo/foo.js')
    );
    expect(resolve(path.resolve('node_modules/foo/index.js'), 'boo/boo'), { js: ['js'] }).to.equal(
      path.resolve('node_modules/boo/foo.js')
    );
    expect(resolve(path.resolve('node_modules/bar/index.js'), 'boo/boo.js'), { js: ['js'] }).to.equal(
      path.resolve('node_modules/boo/foo.js')
    );
    expect(resolve(path.resolve('node_modules/bar/index.js'), 'boo/boo'), { js: ['js'] }).to.equal(
      path.resolve('node_modules/boo/foo.js')
    );
  });
  it('should resolve a css file in the same source directory', () => {
    expect(resolve(path.resolve('bar.css'), './foo.css')).to.eql(path.resolve('foo.css'));
  });
  it('should resolve an implicitly relative css file reference', () => {
    expect(resolve(path.resolve('src/package/foo.css'), 'bar')).to.equal(path.resolve('src/package/bar.css'));
  });
});
