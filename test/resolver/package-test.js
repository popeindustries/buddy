'use strict';

const { createCaches } = require('../../lib/cache');
const { expect } = require('chai');
const config = require('../../lib/resolver/config');
const path = require('path');
const pkg = require('../../lib/resolver/package');

let cache;

describe('resolver:package', () => {
  before(() => {
    cache = createCaches().resolverCache;
    process.chdir(path.resolve(__dirname, 'fixtures'));
  });
  afterEach(() => {
    cache.clear(true);
  });

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
      expect(pkg.resolvePath(path.resolve('node_modules/@popeindustries/test'))).to.eql(
        path.resolve('node_modules/@popeindustries/test')
      );
      expect(pkg.resolvePath(path.resolve('node_modules/@popeindustries/test/test.js'))).to.eql(
        path.resolve('node_modules/@popeindustries/test')
      );
    });
    it('should return a package path relative to the nearest node_modules directory', () => {
      expect(pkg.resolvePath(path.resolve('nested/bar.js'))).to.eql(path.resolve('nested'));
    });
  });

  describe('resolving package name', () => {
    it('should return the name of a node_modules package', () => {
      expect(pkg.resolveName(path.join('node_modules', 'foo'))).to.equal('foo');
      expect(pkg.resolveName(path.join('node_modules', 'foo') + path.sep)).to.equal('foo');
    });
    it('should return the name of a scoped node_modules package', () => {
      expect(pkg.resolveName(path.join('node_modules', '@popeindustries', 'foo'))).to.equal(
        path.join('@popeindustries', 'foo')
      );
      expect(pkg.resolveName(path.join('node_modules', '@popeindustries', 'foo') + path.sep)).to.equal(
        path.join('@popeindustries', 'foo')
      );
    });
  });

  describe('retrieving details', () => {
    it('should return details for the project root package if not found', () => {
      const details = pkg.getDetails(path.resolve('node_modules/zing'), { cache });

      expect(details).to.have.property('name', 'project');
    });
    it('should return details for the project root package', () => {
      const details = pkg.getDetails(process.cwd(), config());

      expect(details).to.have.property('isNestedProjectPackage', false);
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
    it('should return details for a package nested under root', () => {
      const details = pkg.getDetails(path.resolve('nested/foo.js'), config());

      expect(details).to.have.property('isNestedProjectPackage', true);
      expect(details).to.have.property('name', 'project/nested');
      expect(details).to.have.property('main', '');
      expect(details).to.have.property('manifestpath', '');
      expect(details.paths).to.contain(path.resolve('nested/node_modules'));
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
    it('should cache details', () => {
      const c = config();

      expect(pkg.getDetails(path.resolve('src/index.js'), c)).to.equal(pkg.getDetails(process.cwd(), c));
    });
  });
});
