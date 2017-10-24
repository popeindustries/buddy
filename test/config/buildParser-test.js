'use strict';

const { expect } = require('chai');
const buildParser = require('../../lib/config/buildParser');
const configFactory = require('../../lib/config/index');
const path = require('path');

let dummyConfig;

describe.skip('buildParser', () => {
  beforeEach(() => {
    process.chdir(path.resolve(__dirname, 'fixtures'));
    dummyConfig = {
      builds: [],
      caches: {},
      fileExtensions: {
        css: ['css'],
        html: ['html', 'htm'],
        image: ['gif', 'jpg', 'jpeg', 'png', 'svg'],
        js: ['js'],
        json: ['json']
      },
      fileFactory: configFactory({}).fileFactory,
      runtimeOptions: {
        compress: false,
        deploy: false,
        grep: false,
        invert: false,
        reload: false,
        script: false,
        serve: false,
        watch: false,
        verbose: false
      },
      server: {
        webroot: ''
      },
      url: ''
    };
  });

  it('should handle deprecated "targets" format', () => {
    dummyConfig.builds = {
      targets: [
        {
          input: 'src/hey.js',
          output: 'js'
        }
      ]
    };
    buildParser(dummyConfig);

    expect(dummyConfig.builds[0].inputpaths[0]).to.equal(path.resolve('src/hey.js'));
  });
  it('should allow passing build data "input" that doesn\'t exist', () => {
    dummyConfig.builds = [
      {
        input: 'src/hey.js',
        output: 'js'
      }
    ];
    buildParser(dummyConfig);

    expect(dummyConfig.builds[0].inputpaths[0]).to.equal(path.resolve('src/hey.js'));
  });
  it('should parse build array "input"', () => {
    dummyConfig.builds = [
      {
        input: ['src/hey.js', 'src/ho.js'],
        output: 'js'
      }
    ];
    buildParser(dummyConfig);

    expect(dummyConfig.builds[0].input).to.eql(['src/hey.js', 'src/ho.js']);
    expect(dummyConfig.builds[0].inputpaths).to.eql([path.resolve('src/hey.js'), path.resolve('src/ho.js')]);
    expect(dummyConfig.builds[0].outputpaths).to.eql([path.resolve('js/hey.js'), path.resolve('js/ho.js')]);
  });
  it('should parse build when "input" and "output" are arrays of same length', () => {
    dummyConfig.builds = [
      {
        input: ['src/main.js', 'src/sub.js'],
        output: ['js/main.js', 'js/sub.js']
      }
    ];
    buildParser(dummyConfig);

    expect(dummyConfig.builds[0].inputpaths).to.eql([path.resolve('src/main.js'), path.resolve('src/sub.js')]);
    expect(dummyConfig.builds[0].outputpaths).to.eql([path.resolve('js/main.js'), path.resolve('js/sub.js')]);
  });
  it('should parse batch build', () => {
    dummyConfig.builds = [
      {
        input: 'src/',
        output: 'js'
      }
    ];
    buildParser(dummyConfig);

    expect(dummyConfig.builds[0].inputpaths).to.eql([path.resolve('src/main.js'), path.resolve('src/module.js')]);
    expect(dummyConfig.builds[0].outputpaths).to.eql([path.resolve('js/main.js'), path.resolve('js/module.js')]);
    expect(dummyConfig.builds[0].batch).to.be(true);
  });
  it('should parse batch build target with nested resources', () => {
    dummyConfig.builds = [
      {
        input: 'src-nested/',
        output: 'js'
      }
    ];
    buildParser(dummyConfig);

    expect(dummyConfig.builds[0].inputpaths).to.eql([
      path.resolve('src-nested/main.js'),
      path.resolve('src-nested/module.js'),
      path.resolve('src-nested/nested/sub.js'),
      path.resolve('src-nested/nested/sub2.js')
    ]);
    expect(dummyConfig.builds[0].outputpaths).to.eql([
      path.resolve('js/main.js'),
      path.resolve('js/module.js'),
      path.resolve('js/nested/sub.js'),
      path.resolve('js/nested/sub2.js')
    ]);
    expect(dummyConfig.builds[0].batch).to.be(true);
  });
  it('should parse batch build target with directory input', () => {
    dummyConfig.builds = [
      {
        input: 'src-nested/nested',
        output: 'js'
      }
    ];
    buildParser(dummyConfig);

    expect(dummyConfig.builds[0].inputpaths).to.eql([
      path.resolve('src-nested/nested/sub.js'),
      path.resolve('src-nested/nested/sub2.js')
    ]);
    expect(dummyConfig.builds[0].outputpaths).to.eql([
      path.resolve('js/nested/sub.js'),
      path.resolve('js/nested/sub2.js')
    ]);
    expect(dummyConfig.builds[0].batch).to.be(true);
  });
  it('should parse batch build target with directory content input', () => {
    dummyConfig.builds = [
      {
        input: 'src-nested/nested/',
        output: 'js'
      }
    ];
    buildParser(dummyConfig);

    expect(dummyConfig.builds[0].inputpaths).to.eql([
      path.resolve('src-nested/nested/sub.js'),
      path.resolve('src-nested/nested/sub2.js')
    ]);
    expect(dummyConfig.builds[0].outputpaths).to.eql([path.resolve('js/sub.js'), path.resolve('js/sub2.js')]);
    expect(dummyConfig.builds[0].batch).to.be(true);
  });
  it('should parse build target with nested builds', () => {
    dummyConfig.builds = [
      {
        input: 'src-nested/main.js',
        output: 'js',
        build: [
          {
            input: 'src-nested/nested/sub.js',
            output: 'js'
          }
        ]
      }
    ];
    buildParser(dummyConfig);

    expect(dummyConfig.builds[0].builds).to.have.length(1);
    expect(dummyConfig.builds[0].childInputpaths).to.eql([path.resolve('src-nested/nested/sub.js')]);
    expect(dummyConfig.builds[0].index).to.equal(1);
    expect(dummyConfig.builds[0].builds[0].index).to.equal(2);
    expect(dummyConfig.builds[0].options).to.equal(dummyConfig.builds[0].builds[0].options);
  });
  it('should parse generated build target based on shared child builds', () => {
    dummyConfig.builds = [
      {
        input: 'children:shared',
        output: 'js/shared.js',
        build: [
          {
            input: 'src/main.js',
            output: 'js'
          },
          {
            input: 'src/module.js',
            output: 'js'
          }
        ]
      }
    ];
    buildParser(dummyConfig);

    expect(dummyConfig.builds[0].inputpaths).to.eql(['__DUMMY__.js']);
    expect(dummyConfig.builds[0].isGeneratedBuild).to.equal(true);
  });
  it('should parse generated build target based on matching child builds', () => {
    dummyConfig.builds = [
      {
        input: 'children:**/node_modules/*',
        output: 'js/shared.js',
        build: [
          {
            input: 'src/main.js',
            output: 'js'
          },
          {
            input: 'src/module.js',
            output: 'js'
          }
        ]
      }
    ];
    buildParser(dummyConfig);

    expect(dummyConfig.builds[0].inputpaths).to.eql(['__DUMMY__.js']);
    expect(dummyConfig.builds[0].isGeneratedBuild).to.equal(true);
  });
  it.skip('should parse build target with nested builds and different "version"', () => {
    dummyConfig.builds = [
      {
        input: 'src-nested/main.js',
        output: 'js',
        version: 'es2015',
        build: [
          {
            input: 'src-nested/nested/sub.js',
            output: 'js',
            version: 'es2016'
          }
        ]
      }
    ];
    buildParser(dummyConfig);

    const parentFileFactory = dummyConfig.builds[0].fileFactory;
    const childFileFactory = dummyConfig.builds[0].builds[0].fileFactory;

    const parentFile = parentFileFactory(dummyConfig.builds[0].inputpaths[0]);
    const childFile = childFileFactory(dummyConfig.builds[0].builds[0].inputpaths[0]);

    expect(parentFileFactory).to.not.equal(childFileFactory);
    expect(parentFile.options.pluginOptions.babelFingerprint).to.not.equal(
      childFile.options.pluginOptions.babelFingerprint
    );
  });
  it('should parse build target glob pattern "input"', () => {
    dummyConfig.builds = [
      {
        input: 'src/ma*.js',
        output: 'js'
      }
    ];
    buildParser(dummyConfig);

    expect(dummyConfig.builds[0].inputpaths).to.eql([path.resolve('src/main.js')]);
    expect(dummyConfig.builds[0].outputpaths).to.eql([path.resolve('js/main.js')]);
  });
  it('should parse build target glob pattern array "input"', () => {
    dummyConfig.builds = [
      {
        input: 'src/m*.js',
        output: 'js'
      }
    ];
    buildParser(dummyConfig);

    expect(dummyConfig.builds[0].inputpaths).to.eql([path.resolve('src/main.js'), path.resolve('src/module.js')]);
    expect(dummyConfig.builds[0].outputpaths).to.eql([path.resolve('js/main.js'), path.resolve('js/module.js')]);
  });
  it('should not parse build target "input" when not matched with "--grep" option', () => {
    dummyConfig.runtimeOptions.grep = '*.css';
    dummyConfig.builds = [
      {
        input: 'src/hey.js',
        output: 'js'
      }
    ];
    buildParser(dummyConfig);

    expect(dummyConfig.builds).to.eql([]);
  });
  it('should parse build target "output"', () => {
    dummyConfig.builds = [
      {
        input: 'src/hey.js',
        output: 'js'
      }
    ];
    buildParser(dummyConfig);

    expect(dummyConfig.builds[0].output).to.eql('js');
    expect(dummyConfig.builds[0].outputpaths).to.eql([path.resolve('js/hey.js')]);
  });
  it('should parse array of directory "output"', () => {
    dummyConfig.builds = [
      {
        input: ['src/', 'src-nested/nested/'],
        output: 'js'
      }
    ];
    buildParser(dummyConfig);

    expect(dummyConfig.builds[0].outputpaths).to.contain(path.resolve('js/main.js'));
    expect(dummyConfig.builds[0].outputpaths).to.contain(path.resolve('js/sub.js'));
  });
  it('should parse build target "output_compressed"', () => {
    dummyConfig.runtimeOptions.compress = true;
    dummyConfig.builds = [
      {
        input: 'src/hey.js',
        output: 'js',
        output_compressed: 'c'
      }
    ];
    buildParser(dummyConfig);

    expect(dummyConfig.builds[0].output).to.eql('c');
    expect(dummyConfig.builds[0].outputpaths).to.eql([path.resolve('c/hey.js')]);
  });
  it('should throw an error when passed build target with directory "input" and a file "output"', () => {
    let errored = false;

    dummyConfig.builds = [
      {
        input: 'src',
        output: 'js/main.js'
      }
    ];
    try {
      buildParser(dummyConfig);
    } catch (err) {
      errored = true;
      expect(err).to.be.an(Error);
    }
    expect(errored).to.equal(true);
  });
  it('should throw an error when passed build target with directory "input" and a file "output" with array', () => {
    let errored = false;

    dummyConfig.builds = [
      {
        input: ['src/main.js', 'src'],
        output: ['js/main.js', 'js/foo.js']
      }
    ];
    try {
      buildParser(dummyConfig);
    } catch (err) {
      errored = true;
      expect(err).to.be.an(Error);
    }
    expect(errored).to.equal(true);
  });
  it('should throw an error when passed build target with single file "input" and multiple file "output"', () => {
    let errored = false;

    dummyConfig.builds = [
      {
        input: 'src/main.js',
        output: ['js/main.js', 'js/foo.js']
      }
    ];
    try {
      buildParser(dummyConfig);
    } catch (err) {
      errored = true;
      expect(err).to.be.an(Error);
    }
    expect(errored).to.equal(true);
  });
  it('should throw an error when "input" will overwrite "output"', () => {
    let errored = false;

    dummyConfig.builds = [
      {
        input: 'src/main.js',
        output: 'src/main.js'
      }
    ];
    try {
      buildParser(dummyConfig);
    } catch (err) {
      errored = true;
      expect(err).to.be.an(Error);
    }
    expect(errored).to.equal(true);
  });
  it('should throw an error when batch "input" will overwrite "output"', () => {
    let errored = false;

    dummyConfig.builds = [
      {
        input: 'src',
        output: '.'
      }
    ];
    try {
      buildParser(dummyConfig);
    } catch (err) {
      errored = true;
      expect(err).to.be.an(Error);
    }
    expect(errored).to.equal(true);
  });
  it('should return a build target with "isAppServer" set to TRUE when "server.file" is the same as "input"', () => {
    dummyConfig.server = { file: 'src/main.js' };
    dummyConfig.builds = [
      {
        input: 'src/main.js'
      }
    ];
    buildParser(dummyConfig);

    expect(dummyConfig.builds[0]).to.have.property('isAppServer', true);
  });
  it('should return a build target with "isAppServer=true" when "server.file" is in directory "input"', () => {
    dummyConfig.server = { file: 'src/main.js' };
    dummyConfig.builds = [
      {
        input: 'src'
      }
    ];
    buildParser(dummyConfig);

    expect(dummyConfig.builds[0]).to.have.property('isAppServer', true);
  });
  it('should return a build target with "isAppServer=true" when "server.file" matches a globbed "input"', () => {
    dummyConfig.server = { file: 'src/main.js' };
    dummyConfig.builds = [
      {
        input: 'src/*.js'
      }
    ];
    buildParser(dummyConfig);

    expect(dummyConfig.builds[0]).to.have.property('isAppServer', true);
  });
  it.skip('should return a build target with "browser=false" when "version" includes "node"', () => {
    dummyConfig.builds = [
      {
        input: 'src/*.js',
        version: 'node'
      }
    ];
    buildParser(dummyConfig);

    expect(dummyConfig.builds[0]).to.have.property('browser', false);
  });
  it.skip('should return a build target with "browser=false" when "version" includes "server"', () => {
    dummyConfig.builds = [
      {
        input: 'src/*.js',
        version: ['server']
      }
    ];
    buildParser(dummyConfig);

    expect(dummyConfig.builds[0]).to.have.property('browser', false);
  });
});
