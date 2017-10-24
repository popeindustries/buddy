'use strict';

const { exec } = require('child_process');
const { expect } = require('chai');
const find = require('../lib/find');
const os = require('os');
const path = require('path');

describe('buddy-cli', () => {
  beforeEach(() => {
    process.chdir(__dirname);
  });

  describe('find', () => {
    it('should find a local instance of buddy', (done) => {
      process.chdir(path.resolve(__dirname, 'fixtures/project'));
      find(true, (err, buddyFactory, version) => {
        expect(buddyFactory).to.be.a('function');
        expect(version).to.equal('1.0.0');
        done();
      });
    });
    it.skip('should find a local instance of a buddy module', (done) => {
      process.chdir(path.resolve(__dirname, 'fixtures'));
      find(true, (err, buddyFactory, version) => {
        expect(buddyFactory).to.be.a('function');
        expect(version).to.equal('1.0.0');
        done();
      });
    });
    it('should return an error when buddy not found', (done) => {
      process.chdir(os.tmpdir());
      find(true, (err, buddyFactory, version) => {
        expect(err).to.be.ok();
        done();
      });
    });
  });

  describe.skip('cli', () => {
    it('should output --help if called without command', (done) => {
      exec('node ../../index.js', { cwd: path.resolve(__dirname, 'fixtures') }, (err, stdout, stderr) => {
        expect(stdout).to.match(/Usage: index \[options\]/);
        done();
      });
    });
    it('should run a build command', (done) => {
      exec('node ../../index.js build', { cwd: path.resolve(__dirname, 'fixtures') }, (err, stdout, stderr) => {
        expect(stdout).to.equal('build undefined\n');
        done();
      });
    });
    it('should run a build command from a nested project directory', (done) => {
      exec('node ../../../../index.js build', { cwd: path.resolve(__dirname, 'fixtures/project/src') }, (err, stdout, stderr) => {
        expect(stdout).to.equal('build undefined\n');
        done();
      });
    });
    it('should run a build command with options', (done) => {
      exec('node ../../index.js build --compress', { cwd: path.resolve(__dirname, 'fixtures') }, (err, stdout, stderr) => {
        expect(stdout).to.equal('build undefined\n');
        expect(JSON.parse(stderr)).to.have.property('compress', true);
        done();
      });
    });
    it('should run a build command with specified config file', (done) => {
      exec('node ../../index.js build buddy.js', { cwd: path.resolve(__dirname, 'fixtures') }, (err, stdout, stderr) => {
        expect(stdout).to.equal('build buddy.js\n');
        done();
      });
    });
  });
});