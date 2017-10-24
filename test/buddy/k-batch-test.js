'use strict';

const { expect } = require('chai');
const buddyFactory = require('../../lib/buddy');
const fs = require('fs');
const path = require('path');
const rimraf = require('rimraf');
const stylusPlugin = require('../../packages/buddy-plugin-stylus');

let buddy;

describe('BATCH', () => {
  before(() => {
    process.chdir(path.resolve(__dirname, 'fixtures/buddy/build'));
  });
  beforeEach(() => {
    buddy = null;
    process.env.NODE_ENV = 'test';
  });
  afterEach(() => {
    if (buddy) buddy.destroy();
    rimraf.sync(path.resolve('output'));
  });
  after(() => {
    ['yarn.lock', 'node_modules', 'package.json'].forEach(p => {
      if (fs.existsSync(path.resolve(p))) rimraf.sync(path.resolve(p));
    });
  });

  it('should build a directory of 3 js files', done => {
    buddy = buddyFactory({
      input: 'js-directory/flat',
      output: 'output'
    });
    buddy.build((err, filepaths) => {
      expect(filepaths).to.have.length(3);
      filepaths.forEach(filepath => {
        expect(fs.existsSync(filepath)).to.be(true);
        const content = fs.readFileSync(filepath, 'utf8');
        const name = path.basename(filepath);

        expect(content).to.contain('/** BUDDY BUILT **/');
        expect(content).to.contain("$m['js-directory/flat");
        if (name == 'foo.js') expect(content).to.contain("if ('test' == 'production')");
      });
      done();
    });
  });
  it('should build a directory of 3 unwrapped js files if "bundle" is false', done => {
    buddy = buddyFactory({
      input: 'js-directory/flat',
      output: 'output',
      bundle: false
    });
    buddy.build((err, filepaths) => {
      expect(filepaths).to.have.length(3);
      filepaths.forEach(filepath => {
        const content = fs.readFileSync(filepath, 'utf8');
        const name = path.basename(filepath);

        expect(fs.existsSync(filepath)).to.be(true);
        expect(fs.readFileSync(filepath, 'utf8')).to.not.contain('$m[');
        if (name == 'foo.js') expect(content).to.contain("if (process.env.NODE_ENV == 'production')");
      });
      done();
    });
  });
  it('should build a directory of unwrapped js files if "bundle" is false, including dependencies', done => {
    buddy = buddyFactory({
      input: 'js-directory/dependant',
      output: 'output',
      bundle: false
    });
    buddy.build((err, filepaths) => {
      expect(filepaths).to.have.length(3);
      filepaths.forEach(filepath => {
        expect(fs.existsSync(filepath)).to.be(true);
        const content = fs.readFileSync(filepath, 'utf8');

        expect(content).to.not.contain('$m[');
        expect(content).to.not.contain('/** BUDDY BUILT **/');
      });
      done();
    });
  });
  it('should build a directory of 3 js files, including nested directories', done => {
    buddy = buddyFactory({
      input: 'js-directory/nested',
      output: 'output'
    });
    buddy.build((err, filepaths) => {
      expect(filepaths).to.have.length(3);
      filepaths.forEach(filepath => {
        expect(fs.existsSync(filepath)).to.be(true);
        const content = fs.readFileSync(filepath, 'utf8');
        const name = path.basename(filepath, '.js');

        expect(content).to.contain("$m['js-directory/nested");
        if (name == 'index.js') expect(filepath).to.contain('nested/boo/index.js');
      });
      done();
    });
  });
  it('should build a directory of 2 js files, including dependencies in nested directories', done => {
    buddy = buddyFactory({
      input: 'js-directory/dependant',
      output: 'output'
    });
    buddy.build((err, filepaths) => {
      expect(filepaths).to.have.length(2);
      filepaths.forEach(filepath => {
        expect(fs.existsSync(filepath)).to.be(true);
        const content = fs.readFileSync(filepath, 'utf8');

        expect(content).to.contain("$m['js-directory/dependant");
      });
      done();
    });
  });
  it('should build a directory of 2 css files', done => {
    buddy = buddyFactory(
      {
        input: 'css-directory',
        output: 'output'
      },
      { plugins: [stylusPlugin] }
    );
    buddy.build((err, filepaths) => {
      expect(filepaths).to.have.length(2);
      filepaths.forEach(filepath => {
        expect(fs.existsSync(filepath)).to.be(true);
      });
      done();
    });
  });
  it('should build multiple css files with shared dependencies', done => {
    buddy = buddyFactory(
      {
        input: ['one.styl', 'two.styl'],
        output: 'output'
      },
      { plugins: [stylusPlugin] }
    );
    buddy.build((err, filepaths) => {
      expect(filepaths).to.have.length(2);
      expect(fs.existsSync(filepaths[0])).to.be(true);
      const content1 = fs.readFileSync(filepaths[0], 'utf8');
      const content2 = fs.readFileSync(filepaths[1], 'utf8');

      expect(content1).to.contain("colour: '#ffffff';");
      expect(content2).to.contain("colour: '#ffffff';");
      done();
    });
  });
  it('should build a directory with mixed content, including dependencies', done => {
    buddy = buddyFactory(
      {
        input: 'mixed-directory',
        output: 'output'
      },
      { plugins: [stylusPlugin] }
    );
    buddy.build((err, filepaths) => {
      expect(filepaths).to.have.length(2);
      filepaths.forEach(filepath => {
        expect(fs.existsSync(filepath)).to.be(true);
        const ext = path.extname(filepath);
        const content = fs.readFileSync(filepath, 'utf8');

        if (ext == '.js') {
          expect(content).to.contain("$m['mixed-directory/bar'] =");
          expect(content).to.contain("$m['mixed-directory/foo'] =");
        } else {
          expect(content).to.contain('body {');
          expect(content).to.contain('h1 {');
        }
      });
      done();
    });
  });
  it('should build a globbed collection of js files', done => {
    buddy = buddyFactory({
      input: 'js-directory/flat/{foo,bar}.js',
      output: 'output'
    });
    buddy.build((err, filepaths) => {
      expect(filepaths).to.have.length(2);
      filepaths.forEach(filepath => {
        expect(fs.existsSync(filepath)).to.be(true);
        const content = fs.readFileSync(filepath, 'utf8');

        expect(content).to.contain("$m['js-directory/flat/");
      });
      done();
    });
  });
  it('should build a globbed collection of mixed files', done => {
    buddy = buddyFactory(
      {
        input: 'mixed-directory/foo.{js,styl}',
        output: 'output'
      },
      { plugins: [stylusPlugin] }
    );
    buddy.build((err, filepaths) => {
      expect(filepaths).to.have.length(2);
      filepaths.forEach(filepath => {
        expect(fs.existsSync(filepath)).to.be(true);
        const ext = path.extname(filepath);
        const content = fs.readFileSync(filepath, 'utf8');

        if (ext == '.js') {
          expect(content).to.contain("$m['mixed-directory/bar'] =");
          expect(content).to.contain("$m['mixed-directory/foo'] =");
        } else {
          expect(content).to.contain('body {');
          expect(content).to.contain('h1 {');
        }
      });
      done();
    });
  });
  it('should build an array of js files', done => {
    buddy = buddyFactory({
      input: ['js-directory/flat/foo.js', 'js-directory/nested/bar.js'],
      output: 'output'
    });
    buddy.build((err, filepaths) => {
      expect(filepaths).to.have.length(2);
      filepaths.forEach(filepath => {
        expect(fs.existsSync(filepath)).to.be(true);
        expect(fs.readFileSync(filepath, 'utf8')).to.contain("$m['js-directory/");
      });
      done();
    });
  });
  it('should build an array of mixed files', done => {
    buddy = buddyFactory(
      {
        input: ['mixed-directory/foo.js', 'mixed-directory/foo.styl'],
        output: 'output'
      },
      { plugins: [stylusPlugin] }
    );
    buddy.build((err, filepaths) => {
      expect(filepaths).to.have.length(2);
      filepaths.forEach(filepath => {
        expect(fs.existsSync(filepath)).to.be(true);
        const ext = path.extname(filepath);
        const content = fs.readFileSync(filepath, 'utf8');

        if (ext == '.js') {
          expect(content).to.contain("$m['mixed-directory/bar'] =");
          expect(content).to.contain("$m['mixed-directory/foo'] =");
        } else {
          expect(content).to.contain('body {');
          expect(content).to.contain('h1 {');
        }
      });
      done();
    });
  });
  it('should correctly include shared dependency between files', done => {
    buddy = buddyFactory({
      input: ['bar.js', 'e.js'],
      output: 'output'
    });
    buddy.build((err, filepaths) => {
      expect(filepaths).to.have.length(2);
      filepaths.forEach(filepath => {
        expect(fs.existsSync(filepath)).to.be(true);
        const content = fs.readFileSync(filepath, 'utf8');

        expect(content).to.contain("$m['foo'].exports = 'foo';");
        expect(content).to.contain("_foo = $m['foo'].exports;");
        expect(content).to.not.contain('/*≠≠ foo.js ≠≠*/\n/*≠≠ foo.js ≠≠*/');
      });
      done();
    });
  });
  it('should correctly ignore references to nested build inputs', done => {
    buddy = buddyFactory({
      build: [
        {
          input: 'c.js',
          output: 'output',
          build: [
            {
              input: 'd.js',
              output: 'output'
            }
          ]
        }
      ]
    });
    buddy.build((err, filepaths) => {
      expect(filepaths).to.have.length(2);
      filepaths.forEach(filepath => {
        expect(fs.existsSync(filepath)).to.be(true);
        const name = path.basename(filepath, '.js');
        const content = fs.readFileSync(filepath, 'utf8');

        if (name == 'c') {
          expect(content).to.contain("c__foo = $m['foo'].exports");
          expect(content).to.contain("$m['foo'].exports = 'foo';");
        } else if (name == 'd') {
          expect(content).to.contain("e = $m['e'].exports");
          expect(content).to.contain("e__foo = require('foo')");
          expect(content).to.not.contain("$m['foo'].exports = 'foo';");
        }
      });
      done();
    });
  });
  it('should inline BUDDY html envs from sibling build', done => {
    buddy = buddyFactory({
      build: [
        {
          input: 'foo.js',
          output: 'output',
          label: 'foo'
        },
        {
          input: 'd.html',
          output: 'output'
        }
      ]
    });
    buddy.build((err, filepaths) => {
      expect(filepaths).to.have.length(2);
      filepaths.forEach(filepath => {
        expect(fs.existsSync(filepath)).to.be(true);
        const name = path.basename(filepath, '.js');
        const content = fs.readFileSync(filepath, 'utf8');

        if (name == 'd') {
          expect(content).to.contain("$m['foo'] = { exports: {} };");
        }
      });
      done();
    });
  });
  it('should build a nested child build', done => {
    buddy = buddyFactory({
      build: [
        {
          input: 'foo.js',
          output: 'output',
          build: [
            {
              input: 'bar.js',
              output: 'output'
            }
          ]
        }
      ]
    });
    buddy.build((err, filepaths) => {
      expect(filepaths).to.have.length(2);
      filepaths.forEach(filepath => {
        expect(fs.existsSync(filepath)).to.be(true);
        const name = path.basename(filepath, '.js');
        const content = fs.readFileSync(filepath, 'utf8');

        if (name == 'foo') {
          expect(content).to.contain('buddyRequire');
        } else {
          expect(content).to.contain('buddyRequire');
          expect(content).to.contain("var bar__foo = require('foo');");
        }
      });
      done();
    });
  });
  it('should build a child build based on dynamic js import', done => {
    buddy = buddyFactory({
      build: [
        {
          input: 'dynamic.js',
          output: 'output'
        }
      ]
    });
    buddy.build((err, filepaths) => {
      expect(filepaths).to.have.length(2);
      filepaths.forEach(filepath => {
        expect(fs.existsSync(filepath)).to.be(true);
        const name = path.basename(filepath, '.js');
        const content = fs.readFileSync(filepath, 'utf8');

        if (name == 'dynamic') {
          expect(content).to.contain('buddyLoad');
          expect(content).to.contain(
            "buddyImport('/output/foo-425bf60bc677deed2b2e5627f7313a58.js', 'foo').then(foo => {"
          );
        } else {
          expect(content).to.not.contain('buddyLoad');
        }
      });
      done();
    });
  });
  it('should build a child build based on dynamic js import for server build', done => {
    buddy = buddyFactory({
      build: [
        {
          input: 'dynamic.js',
          output: 'output',
          version: 'node'
        }
      ]
    });
    buddy.build((err, filepaths) => {
      expect(filepaths).to.have.length(2);
      expect(eval(fs.readFileSync(filepaths[0], 'utf8'))).to.be.ok();
      done();
    });
  });
  it('should build a shared parent build based on children', done => {
    buddy = buddyFactory({
      build: [
        {
          input: 'children:shared',
          output: 'output/shared.js',
          children: [
            {
              input: 'l.js',
              output: 'output'
            },
            {
              input: 'm.js',
              output: 'output'
            }
          ]
        }
      ]
    });
    buddy.build((err, filepaths) => {
      expect(filepaths).to.have.length(3);
      filepaths.forEach(filepath => {
        expect(fs.existsSync(filepath)).to.be(true);
        const name = path.basename(filepath, '.js');
        const content = fs.readFileSync(filepath, 'utf8');

        if (name == 'shared') {
          expect(content).to.contain('/*== foo.js ==*/');
          expect(content).to.not.contain('/*== __DUMMY.js__ ==*/');
        } else {
          expect(content).to.contain("require('foo')");
          expect(content).to.not.contain('/*== foo.js ==*/');
        }
      });
      done();
    });
  });
  it('should build a shared parent build based on deeply nested children', done => {
    buddy = buddyFactory({
      build: [
        {
          input: 'children:shared',
          output: 'output/shared.js',
          children: [
            {
              input: 'f.js',
              output: 'output',
              children: [
                {
                  input: 'l.js',
                  output: 'output'
                }
              ]
            },
            {
              input: 'm.js',
              output: 'output'
            }
          ]
        }
      ]
    });
    buddy.build((err, filepaths) => {
      expect(filepaths).to.have.length(4);
      filepaths.forEach(filepath => {
        expect(fs.existsSync(filepath)).to.be(true);
        const name = path.basename(filepath, '.js');
        const content = fs.readFileSync(filepath, 'utf8');

        if (name == 'shared') {
          expect(content).to.contain('/*== foo.js ==*/');
          expect(content).to.not.contain('/*== __DUMMY.js__ ==*/');
        } else {
          expect(content).to.not.contain('/*== foo.js ==*/');
        }
      });
      done();
    });
  });
  it('should build a shared parent build based on batched children', done => {
    buddy = buddyFactory({
      build: [
        {
          input: 'children:shared',
          output: 'output/shared.js',
          children: [
            {
              input: ['l.js', 'm.js'],
              output: 'output'
            }
          ]
        }
      ]
    });
    buddy.build((err, filepaths) => {
      expect(filepaths).to.have.length(3);
      filepaths.forEach(filepath => {
        expect(fs.existsSync(filepath)).to.be(true);
        const name = path.basename(filepath, '.js');
        const content = fs.readFileSync(filepath, 'utf8');

        if (name == 'shared') {
          expect(content).to.contain('/*== foo.js ==*/');
          expect(content).to.not.contain('/*== __DUMMY.js__ ==*/');
        } else {
          expect(content).to.contain("require('foo')");
          expect(content).to.not.contain('/*== foo.js ==*/');
        }
      });
      done();
    });
  });
  it('should build a matching parent build based on children', done => {
    buddy = buddyFactory({
      build: [
        {
          input: 'children:**/node_modules/**/*.js',
          output: 'output/shared.js',
          children: [
            {
              input: 'o.js',
              output: 'output'
            },
            {
              input: 'p.js',
              output: 'output'
            }
          ]
        }
      ]
    });
    buddy.build((err, filepaths) => {
      expect(filepaths).to.have.length(3);
      filepaths.forEach(filepath => {
        expect(fs.existsSync(filepath)).to.be(true);
        const name = path.basename(filepath, '.js');
        const content = fs.readFileSync(filepath, 'utf8');

        if (name == 'shared') {
          expect(content).to.contain('node_modules/lodash/camelCase.js ≠≠*/');
          expect(content).to.not.contain('/*== __DUMMY.js__ ==*/');
        } else {
          expect(content).to.contain("require('lodash/camelCase')");
          expect(content).to.not.contain('node_modules/lodash/camelCase.js ≠≠*/');
        }
      });
      done();
    });
  });
});
