'use strict';

const { expect } = require('chai');
const path = require('path');
const serverParser = require('../../lib/config/serverParser');

let config;

describe('serverParser', () => {
  it('should parse directory path', () => {
    config = serverParser(
      {
        directory: 'www'
      },
      {}
    );
    expect(config).to.have.property('directory', path.resolve('www'));
    expect(config).to.have.property('webroot', path.resolve('www'));
  });
  it('should parse webroot path', () => {
    config = serverParser(
      {
        directory: 'www',
        webroot: 'www/assets'
      },
      {}
    );
    expect(config).to.have.property('directory', path.resolve('www'));
    expect(config).to.have.property('webroot', path.resolve('www/assets'));
  });
  it('should parse array directory path', () => {
    config = serverParser(
      {
        directory: ['www', 'assets']
      },
      {}
    );
    expect(config).to.have.property('directory', path.resolve('www'));
    expect(config).to.have.property('webroot', path.resolve('www'));
    expect(config).to.have.property('extraDirectories').eql([path.resolve('assets')]);
  });
});
