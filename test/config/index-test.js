'use strict';

const cache = require('../../lib/cache');
const configFactory = require('../../lib/config/index');
const expect = require('expect.js');
const path = require('path');
const rimraf = require('rimraf');

let config;

describe('config', () => {
  beforeEach(() => {
    process.chdir(path.resolve(__dirname, 'fixtures'));
  });
  afterEach(() => {
    if (config) config.destroy();
  });
  after(() => {
    rimraf.sync(path.resolve('package.json'));
    rimraf.sync(path.resolve('yarn.lock'));
    rimraf.sync(path.resolve('node_modules'));
  });

  describe('locating config file', () => {
    describe('from a valid working directory', () => {
      it('should return a path to the default js file when no name is specified', () => {
        expect(configFactory().url.toLowerCase()).to.equal(path.resolve('buddy.js').toLowerCase());
      });
      it('should return a path to the named file when a name is specified', () => {
        expect(configFactory('buddy_custom_name.js').url.toLowerCase()).to.equal(
          path.resolve('buddy_custom_name.js').toLowerCase()
        );
      });
      it('should return a path to the default file in the specified directory when a directory name is specified', () => {
        expect(configFactory('nested').url.toLowerCase()).to.equal(path.resolve('buddy.js').toLowerCase());
      });
      it('should return a path to the default json file in the specified directory when a directory name is specified', () => {
        expect(configFactory('json').url.toLowerCase()).to.equal(path.resolve('buddy.json').toLowerCase());
      });
      it('should return a path to the default package.json file in the specified directory when a directory name is specified', () => {
        expect(configFactory('pkgjson').url.toLowerCase()).to.equal(path.resolve('package.json').toLowerCase());
      });
      it('should return a path to the named file in the specified directory when a directory and name are specified', () => {
        expect(configFactory('nested/buddy_custom_name.js').url.toLowerCase()).to.equal(
          path.resolve('buddy_custom_name.js').toLowerCase()
        );
      });
      it('should throw an error when an invalid name is specified', () => {
        let errored = false;

        try {
          configFactory('buddy_no_name.js');
        } catch (err) {
          errored = true;
          expect(err).to.be.an(Error);
        }
        expect(errored).to.equal(true);
      });
    });

    describe('from a valid child working directory', () => {
      it('should return a path to the default file in a parent of the cwd when no name is specified', () => {
        process.chdir(path.join(__dirname, 'fixtures/src'));
        expect(configFactory().url.toLowerCase()).to.equal(
          path.join(__dirname, 'fixtures/buddy.js').toLowerCase()
        );
      });
      it('should parse all npm modules', () => {
        process.chdir(path.join(__dirname, 'fixtures/pkgjson'));
        expect(configFactory().npmModulepaths).to.eql([
          path.resolve('node_modules/@foo/foo'),
          path.resolve('node_modules/bar')
        ]);
      });
    });

    describe('from an invalid working directory', () => {
      it('should return an error', () => {
        let errored = false;

        try {
          process.chdir('/');
          configFactory();
        } catch (err) {
          errored = true;
          expect(err).to.be.an(Error);
        }
        expect(errored).to.equal(true);
      });
    });
  });

  describe('loading', () => {
    it('should return validated file data', () => {
      expect(configFactory('buddy.js').builds).to.be.ok();
    });
    it('should return validated file data for named confg set', () => {
      process.chdir(path.join(__dirname, 'fixtures/named'));
      const config = configFactory('foo');

      expect(config.builds).to.be.ok();
      expect(config.builds[0].input).to.equal('foo.js');
    });
    it('should return validated file data for named env confg set', () => {
      process.chdir(path.join(__dirname, 'fixtures/named-env'));
      const config = configFactory();

      expect(config.builds).to.be.ok();
      expect(config.builds[0].input).to.equal('test.js');
    });
    it('should return validated file data for a package.json config file', () => {
      expect(configFactory('pkgjson/package.json').builds).to.be.ok();
    });
    it('should return validated file data for a passed in JSON object', () => {
      const config = configFactory({
        build: [
          {
            input: 'src-nested/main.js',
            output: 'js',
            build: [
              {
                input: 'src-nested/nested/sub.js',
                output: 'js'
              },
              {
                input: 'src-nested/nested/sub2.js',
                output: 'js'
              }
            ]
          }
        ]
      });

      expect(config.builds).to.be.ok();
      expect(config.builds).to.be.an(Array);
      expect(config.builds[0].sources).to.equal(config.builds[0].builds[0].sources);
    });
    it('should return an error when passed a reference to a malformed file', () => {
      let errored = false;

      try {
        configFactory('buddy_bad.js');
      } catch (err) {
        errored = true;
        expect(err).to.be.an(Error);
      }
      expect(errored).to.equal(true);
    });
    it('should return an error when passed an invalid build configuration', () => {
      let errored = false;

      try {
        configFactory('buddy_bad_build.js');
      } catch (err) {
        errored = true;
        expect(err).to.be.an(Error);
      }
      expect(errored).to.equal(true);
    });
  });

  describe('loading plugins', () => {
    it('should load default plugin modules', () => {
      config = configFactory({ build: {} });
      expect(config.fileExtensions.html).to.eql(['html', 'htm']);
      expect(config.fileDefinitionByExtension.js.name).to.equal('JSFile');
    });
  });

  describe('registerFileExtensionsForType()', () => {
    beforeEach(() => {
      config = configFactory({ build: {} });
    });

    it('should register extension for new file type', () => {
      config.registerFileExtensionsForType(['foo'], 'js');
      expect(config.fileExtensions.js).to.eql(['js', 'json', 'foo']);
    });
    it('should register multiple extensions for existing file type', () => {
      config.registerFileExtensionsForType(['foo', 'bar'], 'js');
      expect(config.fileExtensions.js).to.eql(['js', 'json', 'foo', 'bar']);
    });
  });

  describe('registerTargetVersionForType()', () => {
    it.skip('should register a target version for js type', () => {
      config = configFactory({ build: { input: 'src/main.js', output: '.', version: ['foo'] } });
      config.registerTargetVersionForType('foo', 'js', ['foo']);
      console.log(config);
      // expect(config.fileExtensions.js).to.eql(['js', 'json', 'jsx', 'foo']);
    });
  });

  describe('registerFileDefinitionAndExtensionsForType()', () => {
    it('should register a file definition');
    it('should register a file definition for a new type');
    it('should register a file definition for an existing type');
  });

  describe('extendFileDefinitionForExtensionsOrType()', () => {
    it('should extend a file definition for an extension');
    it('should extend a file definition for a type');
  });

  describe('fileFactory()', () => {
    let options;

    beforeEach(() => {
      const { fileCache, resolverCache } = cache.createCaches();

      config = configFactory({ build: {} });
      options = {
        fileCache,
        fileExtensions: config.fileExtensions,
        fileFactory() {},
        resolverCache,
        runtimeOptions: config.runtimeOptions
      };
    });

    it('should return a file instance for default type', () => {
      const file = config.fileFactory(path.resolve('src/main.js'), options);

      expect(file).to.be.ok();
      expect(file).to.have.property('hash', 'd41d8cd98f00b204e9800998ecf8427e');
      expect(file).to.have.property('type', 'js');
      expect(file).to.have.property('id', 'src/main');
    });
    it('should return a file instance for custom type', () => {
      config.registerFileDefinitionAndExtensionsForType(
        File => {
          return class BARFile extends File {
            constructor(id, filepath, options) {
              super(id, filepath, 'bar', options);
            }
          };
        },
        ['bar'],
        'bar'
      );

      const file = config.fileFactory(path.resolve('src/foo.bar'), options);

      expect(file).to.be.ok();
      expect(file).to.have.property('hash', 'd41d8cd98f00b204e9800998ecf8427e');
      expect(file).to.have.property('type', 'bar');
      expect(file).to.have.property('id', 'src/foo');
    });
    it('should return a file instance for extended default type', () => {
      config.registerFileDefinitionAndExtensionsForType(
        File => {
          return class BARFile extends File {};
        },
        ['bar'],
        'js'
      );

      const file = config.fileFactory(path.resolve('src/foo.bar'), options);

      expect(file).to.be.ok();
      expect(file).to.have.property('hash', 'd41d8cd98f00b204e9800998ecf8427e');
      expect(file).to.have.property('type', 'js');
      expect(file).to.have.property('id', 'src/foo');
    });
  });
});
