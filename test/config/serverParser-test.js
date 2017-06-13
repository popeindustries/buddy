'use strict';

const expect = require('expect.js');
const path = require('path');
const serverParser = require('../../lib/config/serverParser');

let dummyConfig;

describe('serverParser', () => {
  it('should parse directory path', () => {
    dummyConfig = {
      runtimeOptions: {},
      server: {
        directory: 'www'
      }
    };
    serverParser(dummyConfig);
    expect(dummyConfig.server).to.have.property('directory', path.resolve('www'));
    expect(dummyConfig.server).to.have.property('webroot', path.resolve('www'));
  });
  it('should parse array directory path', () => {
    dummyConfig = {
      runtimeOptions: {},
      server: {
        directory: ['www', 'assets']
      }
    };
    serverParser(dummyConfig);
    expect(dummyConfig.server).to.have.property('directory', path.resolve('www'));
    expect(dummyConfig.server).to.have.property('webroot', path.resolve('www'));
    expect(dummyConfig.server).to.have.property('extraDirectories').eql([path.resolve('assets')]);
  });
});
