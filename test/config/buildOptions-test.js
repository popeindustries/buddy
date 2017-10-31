'use strict';

const { expect } = require('chai');
const { isBrowserEnvironment, parse, parseVersion } = require('../../lib/config/buildOptions');

describe.only('buildOptions', () => {
  describe('isBrowserEnvironment()', () => {
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

  describe('parseVersion()', () => {
    it('should parse node version', () => {
      expect(parseVersion('node')).to.eql({ node: true, buddy: [] });
      expect(parseVersion('server')).to.eql({ node: true, buddy: [] });
      expect(parseVersion(['node'])).to.eql({ node: true, buddy: [] });
      expect(parseVersion(['server'])).to.eql({ node: true, buddy: [] });
      expect(parseVersion({ node: true })).to.eql({ node: true, buddy: [] });
      expect(parseVersion({ server: true })).to.eql({ node: true, buddy: [] });
      expect(parseVersion({ node: true, chrome: 51 })).to.eql({ node: true, buddy: [] });
    });
    it('should parse specific node version', () => {
      expect(parseVersion({ node: '6' })).to.eql({ node: '6', buddy: [] });
      expect(parseVersion({ node: 6 })).to.eql({ node: '6', buddy: [] });
      expect(parseVersion({ node: 'current' })).to.eql({ node: 'current', buddy: [] });
      expect(parseVersion(['node', 'es6'])).to.eql({ node: '6.5', buddy: [] });
      expect(parseVersion(['es6', 'node'])).to.eql({ node: '6.5', buddy: [] });
      expect(parseVersion(['server', 'es6'])).to.eql({ node: '6.5', buddy: [] });
      expect(parseVersion({ node: true, es6: true })).to.eql({ node: '6.5', buddy: [] });
      expect(parseVersion({ server: true, es6: true })).to.eql({ node: '6.5', buddy: [] });
    });
    it('should parse browser version', () => {
      expect(parseVersion('es6')).to.eql({ browsers: ['chrome 51'], buddy: [] });
      expect(parseVersion('> 5%')).to.eql({ browsers: ['> 5%'], buddy: [] });
      expect(parseVersion(['es6'])).to.eql({ browsers: ['chrome 51'], buddy: [] });
      expect(parseVersion(['> 5%'])).to.eql({ browsers: ['> 5%'], buddy: [] });
      expect(parseVersion(['> 5%', 'not ie 10'])).to.eql({ browsers: ['> 5%', 'not ie 10'], buddy: [] });
      expect(parseVersion({ chrome: 51 })).to.eql({ browsers: ['chrome 51'], buddy: [] });
      expect(parseVersion({ chrome: '51' })).to.eql({ browsers: ['chrome 51'], buddy: [] });
      expect(parseVersion({ browsers: ['> 5%', 'not ie 10'] })).to.eql({ browsers: ['> 5%', 'not ie 10'], buddy: [] });
    });
    it('should parse buddy plugins', () => {
      expect(parseVersion('react')).to.eql({ browsers: [], buddy: ['react'] });
      expect(parseVersion(['react'])).to.eql({ browsers: [], buddy: ['react'] });
      expect(parseVersion(['react', 'es6'])).to.eql({ browsers: ['chrome 51'], buddy: ['react'] });
      expect(parseVersion(['react', 'node'])).to.eql({ node: true, buddy: ['react'] });
      expect(parseVersion({ react: true })).to.eql({ browsers: [], buddy: ['react'] });
      expect(parseVersion({ react: true, node: true })).to.eql({ node: true, buddy: ['react'] });
    });
  });

  describe.only('parse', () => {
    describe('js', () => {
      it('should configure default babel plugins', () => {
        const options = parse();

        expect(options.babel.plugins).to.have.length(1);
        expect(options.babel.plugins[0][0]).to.equal('transform-runtime');
        expect(options.babelESM.plugins).to.have.length(2);
        expect(options.babelESM.plugins[1][0]).to.equal('transform-es2015-modules-commonjs');
      });
      it('should configure babel env preset with es* string version', () => {
        const options = parse('es6');

        expect(options.babel.presets).to.have.length(1);
        expect(options.babel.presets[0][1].targets.browsers).to.eql(['chrome 51']);
      });
      it('should configure babel env preset with es* array version', () => {
        const options = parse(['es6']);

        expect(options.babel.presets).to.have.length(1);
        expect(options.babel.presets[0][1].targets.browsers).to.eql(['chrome 51']);
      });
      it('should configure babel env preset with es* array version for node', () => {
        const options = parse(['es6', 'node']);

        expect(options.babel.presets).to.have.length(1);
        expect(options.babel.presets[0][1].targets.node).to.eql('6.5');
      });
      it('should configure babel env preset with browserslist string version', () => {
        const options = parse('> 5%');

        expect(options.babel.presets).to.have.length(1);
        expect(options.babel.presets[0][1].targets.browsers).to.eql(['> 5%']);
      });
      it('should configure babel env preset with browserslist array version', () => {
        const options = parse(['> 5%', 'not ie 10']);

        expect(options.babel.presets).to.have.length(1);
        expect(options.babel.presets[0][1].targets.browsers).to.eql(['> 5%', 'not ie 10']);
      });
      it('should configure babel env preset with es* object version', () => {
        const options = parse({ es6: true });

        expect(options.babel.presets).to.have.length(1);
        expect(options.babel.presets[0][1].targets.browsers).to.eql(['chrome 51']);
      });
      it('should configure babel env preset with node version', () => {
        const options = parse({ node: '6' });

        expect(options.babel.presets).to.have.length(1);
        expect(options.babel.presets[0][1].targets.node).to.eql('6');
      });
      it('should configure babel env preset with server version', () => {
        const options = parse({ server: true });

        expect(options.babel.presets).to.have.length(1);
        expect(options.babel.presets[0][1].targets.node).to.eql(true);
      });
      it('should configure babel env preset with browser version', () => {
        const options = parse({ chrome: 51 });

        expect(options.babel.presets).to.have.length(1);
        expect(options.babel.presets[0][1].targets.browsers).to.eql(['chrome 51']);
      });
      it('should configure babel env preset with browserslist version', () => {
        const options = parse({ browsers: ['> 5%', 'not ie 10'] });

        expect(options.babel.presets).to.have.length(1);
        expect(options.babel.presets[0][1].targets.browsers).to.eql(['> 5%', 'not ie 10']);
      });
      it('should configure optional babel plugins', () => {
        const options = parse(undefined, { babel: { plugins: ['foo'] } });

        expect(options.babel.plugins).to.have.length(2);
        expect(options.babel.plugins[1]).to.eql(['foo', {}]);
        expect(options.babelESM.plugins[2]).to.eql(['foo', {}]);
      });
      it('should configure default plugins with override options', () => {
        const options = parse(undefined, {
          babel: { plugins: [['transform-runtime', { helpers: false, foo: true }]] }
        });

        expect(options.babel.plugins[0][1]).to.have.property('helpers', false);
        expect(options.babel.plugins[0][1]).to.have.property('foo', true);
      });
      it('should configure default plugins by alt name with override options', () => {
        const options = parse(undefined, {
          babel: { plugins: [['babel-plugin-transform-runtime', { helpers: false, foo: true }]] }
        });

        expect(options.babel.plugins[0][1]).to.have.property('helpers', false);
        expect(options.babel.plugins[0][1]).to.have.property('foo', true);
      });
    });

    describe('css', () => {
      it('should configure default postcss plugins', () => {
        const options = parse();

        expect(options.postcss.plugins).to.have.length(1);
        expect(options.postcss.plugins[0][0]).to.equal('autoprefixer');
      });
      it('should configure autoprefixer with browserslist string version', () => {
        const options = parse('> 5%');

        expect(options.postcss.plugins).to.have.length(1);
        expect(options.postcss.plugins[0][1].browsers).to.eql(['> 5%']);
      });
      it('should configure autoprefixer with browserslist array version', () => {
        const options = parse(['> 5%', 'not ie 10']);

        expect(options.postcss.plugins).to.have.length(1);
        expect(options.postcss.plugins[0][1].browsers).to.eql(['> 5%', 'not ie 10']);
      });
      it('should configure autoprefixer with browserslist object version', () => {
        const options = parse({ browsers: ['> 5%', 'not ie 10'] });

        expect(options.postcss.plugins).to.have.length(1);
        expect(options.postcss.plugins[0][1].browsers).to.eql(['> 5%', 'not ie 10']);
      });
      it('should configure optional postcss plugins', () => {
        const options = parse(undefined, { postcss: { plugins: ['foo'] } });

        expect(options.postcss.plugins).to.have.length(2);
        expect(options.postcss.plugins[1]).to.eql(['foo', {}]);
      });
      it('should configure default postcss plugins with options', () => {
        const options = parse(undefined, { postcss: { plugins: [['autoprefixer', { browsers: ['> 5%'] }]] } });

        expect(options.postcss.plugins).to.have.length(1);
        expect(options.postcss.plugins[0][0]).to.eql('autoprefixer');
        expect(options.postcss.plugins[0][1].browsers).to.eql(['> 5%']);
      });
      it('should configure default postcss plugins with override options', () => {
        const options = parse('> 5%', { postcss: { plugins: [['autoprefixer', { add: false }]] } });

        expect(options.postcss.plugins).to.have.length(1);
        expect(options.postcss.plugins[0][0]).to.eql('autoprefixer');
        expect(options.postcss.plugins[0][1].browsers).to.eql(['> 5%']);
        expect(options.postcss.plugins[0][1].add).to.eql(false);
      });
      it('should configure autoprefixer postcss plugin with options', () => {
        const options = parse('> 5%', { autoprefixer: { add: false } });

        expect(options.postcss.plugins).to.have.length(1);
        expect(options.postcss.plugins[0][0]).to.eql('autoprefixer');
        expect(options.postcss.plugins[0][1].browsers).to.eql(['> 5%']);
        expect(options.postcss.plugins[0][1].add).to.eql(false);
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
