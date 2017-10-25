'use strict';

const { expect } = require('chai');
const { isBrowserEnvironment, parse } = require('../../lib/config/buildOptions');

describe.only('buildOptions', () => {
  describe('isBrowserEnvironment', () => {
    it('should return "false" for server version', () => {
      expect(isBrowserEnvironment('node')).to.equal(false);
      expect(isBrowserEnvironment('server')).to.equal(false);
      expect(isBrowserEnvironment(['node'])).to.equal(false);
      expect(isBrowserEnvironment(['server'])).to.equal(false);
      expect(isBrowserEnvironment(['node', 'react'])).to.equal(false);
      expect(isBrowserEnvironment({ node: true })).to.equal(false);
      expect(isBrowserEnvironment({ node: true, react: true })).to.equal(false);
    });
    it('should return "true" for browser version', () => {
      expect(isBrowserEnvironment()).to.equal(true);
      expect(isBrowserEnvironment('browser')).to.equal(true);
      expect(isBrowserEnvironment('es6')).to.equal(true);
      expect(isBrowserEnvironment(['browser'])).to.equal(true);
      expect(isBrowserEnvironment(['es6'])).to.equal(true);
      expect(isBrowserEnvironment(['es6', 'react'])).to.equal(true);
      expect(isBrowserEnvironment({ chrome: 50 })).to.equal(true);
      expect(isBrowserEnvironment({ react: true, chrome: 50 })).to.equal(true);
    });
  });

  describe('parse', () => {
    describe('js', () => {
      it.only('should parse default plugins', () => {
        const plugins = parse('js');

        expect(plugins).to.have.property('babel');
        expect(plugins.babel.plugins).to.have.length(2);
      });
      it('should parse es* string version', () => {
        const plugins = parse('js', 'es6');

        expect(plugins).to.have.property('babel');
        expect(plugins.babel.presets[0][1].targets).to.have.property('browsers');
        expect(plugins.babel.presets[0][1].targets.browsers).to.eql(['chrome 51']);
      });
      it('should parse es* array version', () => {
        const plugins = parse('js', ['es6']);

        expect(plugins).to.have.property('babel');
        expect(plugins.babel.presets[0][1].targets).to.have.property('browsers');
        expect(plugins.babel.presets[0][1].targets.browsers).to.eql(['chrome 51']);
      });
      it('should parse node array version', () => {
        const plugins = parse('js', ['es6', 'node']);

        expect(plugins).to.have.property('babel');
        expect(plugins.babel.presets[0][1].targets).to.have.property('browsers');
        expect(plugins.babel.presets[0][1].targets.browsers).to.eql(['chrome 51']);
        expect(plugins.babel.presets[0][1].targets).to.have.property('node', true);
      });
      it('should parse browserlist string version', () => {
        const plugins = parse('js', '> 5%');

        expect(plugins).to.have.property('babel');
        expect(plugins.babel.presets[0][1].targets).to.have.property('browsers');
        expect(plugins.babel.presets[0][1].targets.browsers).to.eql(['> 5%']);
      });
      it('should parse browserlist array version', () => {
        const plugins = parse('js', ['> 5%', 'not ie 10']);

        expect(plugins).to.have.property('babel');
        expect(plugins.babel.presets[0][1].targets).to.have.property('browsers');
        expect(plugins.babel.presets[0][1].targets.browsers).to.eql(['> 5%', 'not ie 10']);
      });
      it('should parse es object version', () => {
        const plugins = parse('js', { es6: true });

        expect(plugins).to.have.property('babel');
        expect(plugins.babel.presets[0][1].targets).to.have.property('browsers');
        expect(plugins.babel.presets[0][1].targets.browsers).to.eql(['chrome 51']);
      });
      it('should parse node object version', () => {
        const plugins = parse('js', { node: '6' });

        expect(plugins).to.have.property('babel');
        expect(plugins.babel.presets[0][1].targets).to.have.property('node', '6');
      });
      it('should parse server object version', () => {
        const plugins = parse('js', { server: true });

        expect(plugins).to.have.property('babel');
        expect(plugins.babel.presets[0][1].targets).to.have.property('node', true);
      });
      it('should parse browser object version', () => {
        const plugins = parse('js', { chrome: 51 });

        expect(plugins).to.have.property('babel');
        expect(plugins.babel.presets[0][1].targets).to.have.property('chrome', 51);
      });
      it('should parse browserlist object version', () => {
        const plugins = parse('js', { browsers: ['> 5%', 'not ie 10'] });

        expect(plugins).to.have.property('babel');
        expect(plugins.babel.presets[0][1].targets)
          .to.have.property('browsers')
          .eql(['> 5%', 'not ie 10']);
      });
      it('should parse default plugins with options', () => {
        const plugins = parse('js', undefined, { babel: { plugins: ['foo'] } });

        expect(plugins).to.have.property('babel');
        expect(plugins.babel.plugins[0]).to.equal('foo');
      });
      it('should parse default plugins with override options', () => {
        const plugins = parse('js', undefined, {
          babel: { plugins: [['babel-plugin-transform-es2015-modules-commonjs', { loose: false }]] }
        });

        expect(plugins).to.have.property('babel');
        expect(plugins.babel.plugins[0][1]).to.have.property('loose', false);
      });
      it('should parse default plugins with alt name override options', () => {
        const plugins = parse('js', undefined, {
          babel: { plugins: [['transform-es2015-modules-commonjs', { loose: false }]] }
        });

        expect(plugins).to.have.property('babel');
        expect(plugins.babel.plugins[0]).to.have.length(2);
        expect(plugins.babel.plugins[0][0]).to.equal('babel-plugin-transform-es2015-modules-commonjs');
        expect(plugins.babel.plugins[0][1]).to.have.property('loose', false);
      });
      it('should parse default plugins with compression', () => {
        const plugins = parse('js', undefined, {}, true);

        expect(plugins).to.have.property('babel');
        expect(plugins.babel.plugins).to.have.length(3);
      });
    });

    describe('css', () => {
      it('should parse default plugins', () => {
        const plugins = parse('css');

        expect(plugins).to.have.property('postcss');
        expect(plugins.postcss.plugins).to.have.length(0);
      });
      it('should parse browserlist string version', () => {
        const plugins = parse('css', '> 5%');

        expect(plugins).to.have.property('postcss');
        expect(plugins.postcss.plugins[0][1]).to.have.property('browsers');
        expect(plugins.postcss.plugins[0][1].browsers).to.eql(['> 5%']);
      });
      it('should parse browserlist array version', () => {
        const plugins = parse('css', ['> 5%', 'not ie 10']);

        expect(plugins).to.have.property('postcss');
        expect(plugins.postcss.plugins[0][1]).to.have.property('browsers');
        expect(plugins.postcss.plugins[0][1].browsers).to.eql(['> 5%', 'not ie 10']);
      });
      it('should parse browserlist object version', () => {
        const plugins = parse('css', { browsers: ['> 5%', 'not ie 10'] });

        expect(plugins).to.have.property('postcss');
        expect(plugins.postcss.plugins[0][1])
          .to.have.property('browsers')
          .eql(['> 5%', 'not ie 10']);
      });
      it('should parse default plugins with options', () => {
        const plugins = parse('css', undefined, { autoprefixer: { browsers: ['> 5%', 'not ie 10'] } });

        expect(plugins).to.have.property('postcss');
        expect(plugins.postcss.plugins[0][1])
          .to.have.property('browsers')
          .eql(['> 5%', 'not ie 10']);
      });
      it('should parse plugins with override options', () => {
        const plugins = parse('css', ['> 5%', 'not ie 10'], { autoprefixer: { add: false } });

        expect(plugins).to.have.property('postcss');
        expect(plugins.postcss.plugins[0][1]).to.have.property('add', false);
      });
      it('should parse plugins but ignore compression override options', () => {
        const plugins = parse('css', ['> 5%', 'not ie 10'], { cssnano: { foo: true } });

        expect(plugins).to.have.property('postcss');
        expect(plugins.postcss.plugins).to.have.length(1);
      });
      it('should parse default plugins with compression', () => {
        const plugins = parse('css', undefined, {}, true);

        expect(plugins).to.have.property('postcss');
        expect(plugins.postcss.plugins).to.have.length(1);
      });
      it('should parse default plugins with compression', () => {
        const plugins = parse('css', '> 5%', {}, true);

        expect(plugins).to.have.property('postcss');
        expect(plugins.postcss.plugins).to.have.length(2);
      });
      it('should parse browserlist string version with compression', () => {
        const plugins = parse('css', '> 5%', {}, true);

        expect(plugins).to.have.property('postcss');
        expect(plugins.postcss.plugins).to.have.length(2);
      });
      it('should parse browserlist string version with compression and override options', () => {
        const plugins = parse('css', '> 5%', { cssnano: { foo: true } }, true);

        expect(plugins).to.have.property('postcss');
        expect(plugins.postcss.plugins).to.have.length(2);
        expect(plugins.postcss.plugins[0][1]).to.have.property('foo', true);
      });
    });

    describe('mixed', () => {
      it('should parse default plugins', () => {
        const plugins = parse('mixed');

        expect(plugins).to.have.property('babel');
        expect(plugins.babel.plugins).to.have.length(2);
      });
      it('should parse es* string version', () => {
        const plugins = parse('mixed', 'es6');

        expect(plugins).to.have.property('babel');
        expect(plugins.babel.presets[0][1].targets).to.have.property('browsers');
        expect(plugins.babel.presets[0][1].targets.browsers).to.eql(['chrome 51']);
        expect(plugins.postcss.plugins[0][1].browsers).to.eql(['chrome 51']);
      });
      it('should parse browserlist string version', () => {
        const plugins = parse('mixed', '> 5%');

        expect(plugins).to.have.property('babel');
        expect(plugins.babel.presets[0][1].targets).to.have.property('browsers');
        expect(plugins.babel.presets[0][1].targets.browsers).to.eql(['> 5%']);
        expect(plugins.postcss.plugins[0][1].browsers).to.eql(['> 5%']);
      });
      it('should parse browserlist array version', () => {
        const plugins = parse('mixed', ['> 5%', 'not ie 10']);

        expect(plugins).to.have.property('babel');
        expect(plugins.babel.presets[0][1].targets).to.have.property('browsers');
        expect(plugins.babel.presets[0][1].targets.browsers).to.eql(['> 5%', 'not ie 10']);
        expect(plugins.postcss.plugins[0][1].browsers).to.eql(['> 5%', 'not ie 10']);
      });
    });
  });

  describe.skip('load()', () => {
    it('should generate default Babel plugins', () => {
      const options = buildPlugins.load('js');

      expect(options.babel.plugins).to.have.length(2);
      expect(options.babel.plugins[0]).to.be.a(Function);
    });
    it('should generate and install Babel plugins based on target version', () => {
      const options = buildPlugins.load('js', undefined, 'node6');

      expect(options.babel.plugins).to.have.length(2);
      expect(options.babel.plugins[0]).to.be.a(Function);
    });
    it('should generate and install Babel plugins based on target version specified with object notation', () => {
      const options = buildPlugins.load('js', undefined, { node: 6 });

      expect(options.babel.plugins).to.have.length(2);
      expect(options.babel.plugins[0]).to.be.a(Function);
    });
    it('should generate and install Babel plugins based on browser target version', () => {
      const options = buildPlugins.load('js', undefined, { chrome: 46 });

      expect(options.babel.plugins).to.have.length(15);
      expect(options.babel.plugins[0]).to.be.a(Function);
    });
    it('should generate and install Babel and Postcss plugins based on browsers list', () => {
      const options = buildPlugins.load(undefined, undefined, { browsers: ['last 2 versions'] });

      // Don't know how many babel plugins
      expect(options.babel.plugins[0]).to.be.a(Function);
      expect(options.postcss.plugins).to.have.length(1);
      expect(options.postcss.plugins[0]).to.be.an(Array);
    });
    it('should ignore unknown target versions', () => {
      const options = buildPlugins.load('js', undefined, 'foo');

      expect(options.babel.plugins).to.have.length(2);
    });
    it('should allow default plugins to be overridden', () => {
      const options = buildPlugins.load('js', {
        babel: { plugins: [['babel-plugin-external-helpers', { foo: true }]] }
      });

      expect(options.babel.plugins).to.have.length(2);
      expect(options.babel.plugins[0][1]).to.have.property('foo', true);
    });
    it('should allow adding custom plugins', () => {
      const options = buildPlugins.load(undefined, { foo: { plugins: ['yaw'] } });

      expect(options.foo.plugins).to.have.length(1);
    });
  });
});
