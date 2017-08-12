'use strict';

const { expect } = require('chai');
const cache = require('../../lib/cache');
const File = require('../../lib/File');
const path = require('path');

let config, file;

describe('File', () => {
  before(() => {
    process.chdir(path.resolve(__dirname, 'fixtures'));
  });
  beforeEach(() => {
    file = new File('foo', path.resolve('src/foo.js'), 'js', {
      browser: true,
      fileFactory: () => {
        return { isLocked: false };
      },
      runtimeOptions: { maps: true }
    });
  });
  afterEach(() => {
    cache.clear();
    if (config) config.destroy();
  });

  describe('constructor()', () => {
    it('should define file properties', () => {
      expect(file).to.have.property('extension', 'js');
      expect(file).to.have.property('relpath', 'src/foo.js');
      expect(file).to.have.property('name', 'foo.js');
    });
    it('should load file content', () => {
      expect(file).to.have.property('hash', 'af1c6f25496712c4303dc6a37b809bdf');
    });
  });

  describe('addDependencies()', () => {
    it('should ignore invalid dependency id', () => {
      file.addDependencies([{ id: './zoop' }], {});
      expect(file.dependencyReferences).to.have.length(0);
    });
    it('should disable dependency reference when watch only build', () => {
      const dependency = { id: 'bar' };

      file.addDependencies([dependency], { watchOnly: true });
      expect(file.dependencyReferences).to.have.length(1);
      expect(dependency).to.have.property('isDisabled', true);
      expect(file.dependencies).to.have.length(0);
    });
    it('should disable dependency reference when disabled via package.json', () => {
      const dependency = { id: 'bat/boop' };

      file.addDependencies([dependency], {});
      expect(file.dependencyReferences).to.have.length(1);
      expect(dependency).to.have.property('isDisabled', true);
      expect(file.dependencies).to.have.length(0);
    });
    it('should ignore dependency reference when it is a parent file', () => {
      const index = new File('index', path.resolve('src/index.js'), 'js', { runtimeOptions: { maps: true } });
      const dependency = { id: './index' };

      file.options.fileFactory = function() {
        index.isLocked = true;
        return index;
      };
      file.addDependencies([dependency], {});
      expect(file.dependencyReferences).to.have.length(1);
      expect(file.dependencies).to.have.length(0);
    });
    it('should ignore dependency reference when it is a child file', () => {
      const index = new File('index', path.resolve('src/index.js'), 'js', { runtimeOptions: { maps: true } });
      const dependency = { id: './index' };

      file.options.fileFactory = function() {
        return index;
      };
      file.addDependencies([dependency], { ignoredFiles: [index.filepath] });
      expect(file.dependencyReferences).to.have.length(1);
      expect(file.dependencies).to.have.length(0);
    });
    it('should store dependant file instance', () => {
      const index = new File('index', path.resolve('src/index.js'), 'js', { runtimeOptions: { maps: true } });
      const dependency = { id: './index' };

      file.options.fileFactory = function() {
        return index;
      };
      file.addDependencies([dependency], {});
      expect(file.dependencyReferences).to.have.length(1);
      expect(file.dependencies.includes(index)).to.eql(true);
    });
    it('should flag dependant file instance as inline if parsed as inline source', () => {
      const index = new File('index', path.resolve('src/index.js'), 'js', { runtimeOptions: { maps: true } });
      const dependency = { id: './index', stack: true };

      file.options.fileFactory = function() {
        return index;
      };
      file.addDependencies([dependency], {});
      expect(file.dependencyReferences).to.have.length(1);
      expect(file.dependencies.includes(index)).to.eql(true);
      expect(index).to.have.property('isInline', true);
    });
  });

  describe('parseWorkflow()', () => {
    it('should return a simple set of workflows', () => {
      file.workflows = { foo: [['foo']], bar: [['bar']] };
      expect(file.parseWorkflow('foo', {})).to.eql(file.workflows.foo[0]);
    });
    it('should return a conditional set of workflows', () => {
      file.workflows = { foo: [['compress:foo']], bar: [['bundle:compress:bar', 'bat']] };
      expect(file.parseWorkflow('foo', { compress: true, bundle: false })).to.eql(['foo']);
      expect(file.parseWorkflow('bar', { compress: true, bundle: false })).to.eql(['bat']);
    });
    it('should return a conditional set of workflows, including negated condition', () => {
      file.workflows = { foo: [['compress:foo']], bar: [['!bundle:compress:bar', 'bat']] };
      expect(file.parseWorkflow('bar', { compress: true, bundle: false })).to.eql(['bar', 'bat']);
    });
  });

  describe('run()', () => {
    it('should run a standard set of workflows', done => {
      file.parse = function(buildOptions, fn) {
        this.foo = true;
        fn();
      };
      file.run('standard', {}, err => {
        expect(file).to.have.property('foo', true);
        done();
      });
    });
    it('should run a standard set of workflows, including for dependencies', done => {
      const bar = new File('bar', path.resolve('src/foo.js'), 'js', { runtimeOptions: {} });

      bar.parse = function(buildOptions, fn) {
        expect(file).to.have.property('foo', true);
        this.bar = true;
        fn();
      };
      file.parse = function(buildOptions, fn) {
        this.dependencies.push(bar);
        this.foo = true;
        fn();
      };
      file.run('standard', {}, err => {
        expect(bar).to.have.property('bar', true);
        done();
      });
    });
  });
});
