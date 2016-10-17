'use strict';

const cache = require('../lib/dependency-resolver/cache');
const config = require('../lib/dependency-resolver/config');
const expect = require('expect.js');
const identify = require('../lib/dependency-resolver/identify');
const pkg = require('../lib/dependency-resolver/package');
const path = require('path');
const resolve = require('../lib/dependency-resolver/resolve');

describe('dependency-resolver', () => {
  before(() => {
    process.chdir(path.resolve(__dirname, 'fixtures/dependency-resolver'));
  });
  afterEach(() => {
    cache.clear(true);
  });

  describe('cache', () => {
    describe('caching a file', () => {
      it('should store a simple file', () => {
        cache.setFile({ path: '/foo/index.js', id: 'foo' });
        expect(cache.getFile('/foo/index.js')).to.eql('foo');
      });
      it('should track versioned modules', () => {
        cache.setFile({ path: '/node_modules/foo/index.js', id: 'foo#1.0.0' });
        expect(cache.hasMultipleVersions('foo#1.0.0')).to.be(false);
        cache.setFile({ path: '/node_modules/bar/node_modules/foo/index.js', id: 'foo#2.0.0' });
        expect(cache.hasMultipleVersions('foo#1.0.0')).to.be(true);
      });
    });
    describe('caching a package', () => {
      it('should store package details for a package path', () => {
        cache.setPackage({ name: 'foo', pkgpath: '/foo', version: '0.0.0', id: 'foo#0.0.0' });
        expect(cache.getPackage('/foo')).to.have.property('name', 'foo');
        expect(cache.getPackage('foo#0.0.0')).to.have.property('name', 'foo');
      });
    });
    describe('clearing', () => {
      it('should reset all internal caches', () => {
        cache.setFile({ path: '/foo/index.js', id: 'foo' });
        cache.clear();
        expect(cache.getFile('/foo/index.js')).to.eql(undefined);
      });
    });
  });

  describe('package', () => {
    describe('resolving package path', () => {
      it('should return the cwd when passed a path outside of node_modules', () => {
        expect(pkg.resolvePath(path.resolve('foo.js'))).to.eql(process.cwd());
        expect(pkg.resolvePath(path.resolve('node_modules'))).to.eql(process.cwd());
      });
      it('should return a package path when passed a node_modules path', () => {
        expect(pkg.resolvePath(path.resolve('node_modules/foo'))).to.eql(path.resolve('node_modules/foo'));
        expect(pkg.resolvePath(path.resolve('node_modules/foo/bar/index.js'))).to.eql(path.resolve('node_modules/foo'));
      });
      it('should return a scoped package path when passed a scoped node_modules path', () => {
        expect(pkg.resolvePath(path.resolve('node_modules/@foo/foo'))).to.eql(path.resolve('node_modules/@foo/foo'));
        expect(pkg.resolvePath(path.resolve('node_modules/@foo/bar/index.js'))).to.eql(path.resolve('node_modules/@foo/bar'));
      });
    });

    describe('resolving package name', () => {
      it('should return the name of a node_modules package', () => {
        expect(pkg.resolveName(path.join('node_modules', 'foo'))).to.equal('foo');
        expect(pkg.resolveName(path.join('node_modules', 'foo') + path.sep)).to.equal('foo');
      });
      it('should return the name of a scoped node_modules package', () => {
        expect(pkg.resolveName(path.join('node_modules', '@popeindustries', 'foo'))).to.equal(path.join('@popeindustries', 'foo'));
        expect(pkg.resolveName(path.join('node_modules', '@popeindustries', 'foo') + path.sep)).to.equal(path.join('@popeindustries', 'foo'));
      });
    });

    describe('retrieving details', () => {
      it('should return nothing for a package that doesn\'t exist', () => {
        const details = pkg.getDetails(path.resolve('node_modules/zing'));

        expect(details).to.eql(undefined);
      });
      it('should return details for the project root package', () => {
        const details = pkg.getDetails(process.cwd(), config());

        expect(details).to.have.property('name', 'project');
        expect(details).to.have.property('main', path.resolve('index.js'));
        expect(details).to.have.property('manifestpath', path.resolve('package.json'));
      });
      it('should return details for the project root package from a nested project file', () => {
        const details = pkg.getDetails(path.resolve('foo.js'), config());

        expect(details).to.have.property('name', 'project');
        expect(details).to.have.property('main', path.resolve('index.js'));
        expect(details).to.have.property('manifestpath', path.resolve('package.json'));
      });
      it('should return details for a node_modules package', () => {
        const details = pkg.getDetails(path.resolve('node_modules/foo'), config());

        expect(details).to.have.property('manifestpath', path.resolve('node_modules/foo/package.json'));
        expect(details).to.have.property('name', 'foo');
        expect(details).to.have.property('main', path.resolve('node_modules/foo/lib/bat.js'));
        expect(details.paths).to.contain(path.resolve('node_modules/foo/node_modules'));
        expect(details.paths).to.contain(path.resolve('node_modules'));
      });
      it('should return details for a node_modules package with no "main" property', () => {
        const details = pkg.getDetails(path.resolve('node_modules/boom'), config());

        expect(details).to.have.property('main', path.resolve('node_modules/boom/index.js'));
      });
      it('should return details for a scoped node_modules package', () => {
        const details = pkg.getDetails(path.resolve('node_modules/@popeindustries/test/test.js'), config());

        expect(details).to.have.property('manifestpath', path.resolve('node_modules/@popeindustries/test/package.json'));
        expect(details).to.have.property('name', '@popeindustries/test');
        expect(details).to.have.property('main', path.resolve('node_modules/@popeindustries/test/test.js'));
      });
      it('should return details for a package with aliases', () => {
        const details = pkg.getDetails(path.resolve('node_modules/browser2'), config());

        expect(details.aliases).to.have.property(path.resolve('node_modules/browser2/bing.js'), 'bing');
      });
      it('should cache details', () => {
        expect(pkg.getDetails(path.resolve('src/index.js'), config())).to.equal(pkg.getDetails(process.cwd()));
      });
    });
  });

  describe('resolve()', () => {
    it('should not resolve a file if the reference file doesn\'t exist', () => {
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
      expect(resolve(path.resolve('foo.js'), './bar', { fileExtensions: { js: ['coffee'] } })).to.equal(path.resolve('bar.coffee'));
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
      expect(resolve(path.resolve('node_modules/bar/node_modules/bat/index.js'), 'foo')).to.equal(path.resolve('node_modules/foo/lib/bat.js'));
    });
    it('should resolve a js package module source path for a deeply nested package module', () => {
      expect(resolve(path.resolve('node_modules/bar/node_modules/bat/index.js'), 'foo/lib/bar')).to.equal(path.resolve('node_modules/foo/lib/bar.js'));
    });
    it('should resolve a scoped js package module path containing a package.json file and a "main" file field', () => {
      expect(resolve(path.resolve('baz.js'), '@popeindustries/test')).to.equal(path.resolve('node_modules/@popeindustries/test/test.js'));
    });
    it('should resolve a scoped js package module source path', () => {
      expect(resolve(path.resolve('baz.js'), '@popeindustries/test/lib/bar')).to.equal(path.resolve('node_modules/@popeindustries/test/lib/bar.js'));
    });
    it('should resolve an aliased module via global alias', () => {
      expect(resolve(path.resolve('baz.js'), 'foo', { globalAliases: { foo: 'baz.js' } })).to.equal(path.resolve('baz.js'));
    });
    it('should resolve a disabled module via global alias', () => {
      expect(resolve(path.resolve('baz.js'), 'foo', { globalAliases: { foo: false } })).to.equal(false);
    });
    it('should resolve an aliased main module file via simple "browser" field', () => {
      expect(resolve(path.resolve('baz.js'), 'browser')).to.equal(path.resolve('node_modules/browser/browser/foo.js'));
    });
    it('should resolve an aliased main file via "browser" hash', () => {
      expect(resolve(path.resolve('baz.js'), 'browser2')).to.equal(path.resolve('node_modules/browser2/browser/foo.js'));
    });
    it('should resolve an aliased main file via "browser" hash with missing relative path prefix', () => {
      expect(resolve(path.resolve('baz.js'), 'browser3')).to.equal(path.resolve('node_modules/browser3/browser/foo.js'));
    });
    it('should resolve a disabled package via "browser" hash', () => {
      expect(resolve(path.resolve('node_modules/browser2/foo.js'), 'bat')).to.equal(false);
    });
    it('should resolve an aliased package with aliased main file via "browser" hash', () => {
      expect(resolve(path.resolve('node_modules/browser2/bar.js'), 'foo')).to.equal(path.resolve('node_modules/browser2/node_modules/bar/lib/bar.js'));
    });
    it('should resolve an aliased package with a file via "browser" hash', () => {
      expect(resolve(path.resolve('node_modules/browser2/foo.js'), 'bar')).to.equal(path.resolve('node_modules/browser2/foo.js'));
    });
    it('should resolve a disabled file via "browser" hash', () => {
      expect(resolve(path.resolve('node_modules/browser2/foo.js'), './bar')).to.equal(false);
      expect(resolve(path.resolve('node_modules/browser2/foo.js'), './bar.js')).to.equal(false);
      expect(resolve(path.resolve('foo.js'), 'browser2/bar')).to.equal(false);
    });
    it('should resolve an aliased file with a package via "browser" hash', () => {
      expect(resolve(path.resolve('node_modules/browser2/foo.js'), './bing')).to.equal(path.resolve('node_modules/browser2/node_modules/bing/index.js'));
      expect(resolve(path.resolve('node_modules/browser2/foo.js'), './bing.js')).to.equal(path.resolve('node_modules/browser2/node_modules/bing/index.js'));
    });
    it('should resolve an aliased package with a package file via "browser" hash', () => {
      expect(resolve(path.resolve('node_modules/browser2/foo.js'), 'bing')).to.equal(path.resolve('node_modules/browser2/node_modules/bing/bing.js'));
    });
    it('should resolve an aliased native module via a "browser" hash', () => {
      expect(resolve(path.resolve('node_modules/browser2/foo.js'), 'http')).to.equal(false);
      expect(resolve(path.resolve('node_modules/browser2/bar.js'), 'net')).to.equal(path.resolve('node_modules/browser2/foo.js'));
    });
    it('should resolve a native module reference', () => {
      expect(resolve(path.resolve('foo.js'), 'http')).to.equal(false);
    });
    it('should resolve root project main file with "browser" alias', () => {
      expect(resolve(path.resolve('foo.js'), 'project')).to.equal(path.resolve('index.js'));
    });
    it('should resolve cached packages of same version', () => {
      expect(resolve(path.resolve('node_modules/foo/index.js'), 'boo')).to.equal(path.resolve('node_modules/boo/index.js'));
      expect(resolve(path.resolve('node_modules/bar/index.js'), 'boo')).to.equal(path.resolve('node_modules/boo/index.js'));
    });
    it('should resolve cached aliased package file of same version', () => {
      expect(resolve(path.resolve('node_modules/foo/index.js'), 'boo/boo.js')).to.equal(path.resolve('node_modules/boo/foo.js'));
      expect(resolve(path.resolve('node_modules/foo/index.js'), 'boo/boo')).to.equal(path.resolve('node_modules/boo/foo.js'));
      expect(resolve(path.resolve('node_modules/bar/index.js'), 'boo/boo.js')).to.equal(path.resolve('node_modules/boo/foo.js'));
      expect(resolve(path.resolve('node_modules/bar/index.js'), 'boo/boo')).to.equal(path.resolve('node_modules/boo/foo.js'));
    });
    it('should resolve a css file in the same source directory', () => {
      expect(resolve(path.resolve('bar.css'), './foo.css')).to.eql(path.resolve('foo.css'));
    });
    it('should resolve an implicitly relative css file reference', () => {
      expect(resolve(path.resolve('src/package/foo.css'), 'bar')).to.equal(path.resolve('src/package/bar.css'));
    });
  });

  describe('identify()', () => {
    it('should not resolve a missing filepath', () => {
      expect(identify('blah')).to.equal('');
    });
    it('should not resolve a relative filepath', () => {
      expect(identify('./foo.js')).to.equal('');
    });
    it('should resolve an ID for a filepath in the default source directory', () => {
      expect(identify(path.resolve('foo.js'))).to.equal('foo.js');
    });
    it('should resolve an ID for a filepath nested in the default source directory', () => {
      expect(identify(path.resolve('nested/bar.js'))).to.equal('nested/bar.js');
    });
    it('should resolve an ID for a package module with missing manifest', () => {
      expect(identify(path.resolve('node_modules/bar/index.js'))).to.equal('bar/index.js');
    });
    it('should resolve an ID for a nested package module with missing manifest', () => {
      expect(identify(path.resolve('node_modules/bar/node_modules/bat/index.js'))).to.equal('bat/index.js');
    });
    it('should resolve an ID for a package module', () => {
      expect(identify(path.resolve('node_modules/foo/lib/bat.js'))).to.equal('foo/lib/bat.js#1.0.0');
    });
    it('should resolve an ID for a package module filepath', () => {
      expect(identify(path.resolve('node_modules/foo/lib/bar.js'))).to.equal('foo/lib/bar.js#1.0.0');
    });
    it('should resolve an ID for a package main filepath with "browser" alias', () => {
      expect(identify(path.resolve('index.js'))).to.equal('project');
    });
    it('should resolve separate IDs for different versions of the same package', () => {
      expect(identify(path.resolve('node_modules/baz/node_modules/foo/lib/bat.js'))).to.equal('foo/lib/bat.js#2.0.0');
      expect(identify(path.resolve('node_modules/foo/lib/bat.js'))).to.equal('foo/lib/bat.js#1.0.0');
    });
    it('should resolve an ID for a scoped package module', () => {
      expect(identify(path.resolve('node_modules/@popeindustries/test/test.js'))).to.equal('@popeindustries/test/test.js#1.0.0');
      expect(identify(path.resolve('node_modules/@popeindustries/test/node_modules/foo/lib/bat.js'))).to.equal('foo/lib/bat.js#2.0.0');
    });
    it('should resolve an ID for a scoped package module filepath', () => {
      expect(identify(path.resolve('node_modules/@popeindustries/test/lib/bar.js'))).to.equal('@popeindustries/test/lib/bar.js#1.0.0');
    });
    it('should resolve an ID for a filepath with multiple "."', () => {
      expect(identify(path.resolve('foo.bar.js'))).to.equal('foo.bar.js');
    });
    it('should resolve an ID for an aliased filepath', () => {
      expect(identify(path.resolve('node_modules/browser2/server/foo.js'))).to.equal('browser2/browser/foo.js#1.0.0');
    });
    it('should not resolve an ID for a disabled filepath', () => {
      expect(identify(path.resolve('node_modules/browser2/bar.js'))).to.equal('browser2/bar.js#1.0.0');
    });
  });
});