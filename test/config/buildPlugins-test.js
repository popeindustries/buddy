'use strict';

const buildPlugins = require('../../lib/config/buildPlugins');
const expect = require('expect.js');

describe('buildPlugins', () => {
  describe('isBrowserEnvironment', () => {
    it('should return "false" for server version', () => {
      expect(buildPlugins.isBrowserEnvironment('node')).to.equal(false);
      expect(buildPlugins.isBrowserEnvironment('server')).to.equal(false);
      expect(buildPlugins.isBrowserEnvironment(['node'])).to.equal(false);
      expect(buildPlugins.isBrowserEnvironment(['server'])).to.equal(false);
      expect(buildPlugins.isBrowserEnvironment(['node', 'react'])).to.equal(false);
      expect(buildPlugins.isBrowserEnvironment({ node: true })).to.equal(false);
      expect(buildPlugins.isBrowserEnvironment({ node: true, react: true })).to.equal(false);
    });
    it('should return "true" for browser version', () => {
      expect(buildPlugins.isBrowserEnvironment('browser')).to.equal(true);
      expect(buildPlugins.isBrowserEnvironment('es6')).to.equal(true);
      expect(buildPlugins.isBrowserEnvironment(['browser'])).to.equal(true);
      expect(buildPlugins.isBrowserEnvironment(['es6'])).to.equal(true);
      expect(buildPlugins.isBrowserEnvironment(['es6', 'react'])).to.equal(true);
      expect(buildPlugins.isBrowserEnvironment({ chrome: 50 })).to.equal(true);
      expect(buildPlugins.isBrowserEnvironment({ react: true, chrome: 50 })).to.equal(true);
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
