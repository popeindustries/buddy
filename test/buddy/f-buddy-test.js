'use strict';

const { expect } = require('chai');
const buddyFactory = require('../../lib/buddy');
const fs = require('fs');
const path = require('path');
const rimraf = require('rimraf');

let buddy;

describe('BUDDY', () => {
  before(() => {
    process.chdir(path.resolve(__dirname, 'fixtures/buddy'));
  });
  beforeEach(() => {
    buddy = null;
    process.env.NODE_ENV = 'test';
  });
  afterEach(() => {
    if (buddy) buddy.destroy();
    rimraf.sync(path.resolve('output'));
  });

  describe('factory', () => {
    before(() => {
      process.chdir(path.resolve(__dirname, 'fixtures/buddy/init'));
    });

    it('should initialize a single build', () => {
      buddy = buddyFactory({
        build: [
          {
            input: 'build/a.js',
            output: '.'
          }
        ]
      });

      expect(buddy.builds).to.have.length(1);
    });
    it('should initialize a single build with nested child build', () => {
      buddy = buddyFactory({
        build: [
          {
            input: 'build/a.js',
            output: '.',
            build: [
              {
                input: 'build/lib',
                output: '.'
              }
            ]
          }
        ]
      });

      expect(buddy.builds).to.have.length(1);
      expect(buddy.builds[0].builds).to.have.length(1);
    });
  });

  describe('script', () => {
    before(() => {
      process.chdir(path.resolve(__dirname, 'fixtures/buddy/script'));
    });

    it('should run a script after successful build', done => {
      buddy = buddyFactory(
        {
          build: [
            {
              input: 'foo.js',
              output: 'output'
            }
          ],
          script: 'node mod.js output/foo.js'
        },
        { script: true }
      );
      buddy.build((err, filepaths) => {
        expect(fs.existsSync(filepaths[0])).to.be(true);
        setTimeout(() => {
          const content = fs.readFileSync(filepaths[0], 'utf8');

          expect(content).to.eql('oops!');
          done();
        }, 100);
      });
    });
  });

  describe('grep', () => {
    before(() => {
      process.chdir(path.resolve(__dirname, 'fixtures/buddy/grep'));
    });

    it('should only build matching build', done => {
      buddy = buddyFactory(
        {
          build: [
            {
              input: 'foo.js',
              output: 'output'
            },
            {
              input: 'foo.css',
              output: 'output'
            }
          ]
        },
        { grep: '*.js' }
      );
      buddy.build((err, filepaths) => {
        expect(filepaths).to.have.length(1);
        expect(fs.existsSync(filepaths[0])).to.be(true);
        expect(filepaths[0]).to.eql(path.resolve('output/foo.js'));
        done();
      });
    });
    it('should only build matching build when globbing input', done => {
      buddy = buddyFactory(
        {
          build: [
            {
              input: '*.js',
              output: 'output'
            },
            {
              input: 'foo.css',
              output: 'output'
            }
          ]
        },
        { grep: 'foo.*' }
      );
      buddy.build((err, filepaths) => {
        expect(filepaths).to.have.length(2);
        expect(filepaths[0]).to.match(/foo\./);
        expect(filepaths[1]).to.match(/foo\./);
        done();
      });
    });
    it('should only build matching build when using "--invert" option', done => {
      buddy = buddyFactory(
        {
          build: [
            {
              input: 'foo.js',
              output: 'output'
            },
            {
              input: 'foo.css',
              output: 'output'
            }
          ]
        },
        { grep: '*.js', invert: true }
      );
      buddy.build((err, filepaths) => {
        expect(filepaths).to.have.length(1);
        expect(fs.existsSync(filepaths[0])).to.be(true);
        expect(filepaths[0]).to.eql(path.resolve('output/foo.css'));
        done();
      });
    });
  });

  describe('watch', () => {
    before(() => {
      process.chdir(path.resolve(__dirname, 'fixtures/buddy/watch'));
    });

    it('should build watch build', done => {
      buddy = buddyFactory(
        {
          input: ['foo.js', 'bar.js']
        },
        { watch: true }
      );
      buddy.build((err, filepaths) => {
        expect(filepaths).to.have.length(0);
        done();
      });
    });
  });
});
