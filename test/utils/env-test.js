'use strict';

const { expect } = require('chai');
const env = require('../../lib/utils/env');
const path = require('path');

describe('env', () => {
  before(() => {
    process.chdir(path.resolve(__dirname, 'fixtures'));
  });
  beforeEach(() => {
    for (const prop in process.env) {
      if (prop.indexOf('BUDDY_') === 0) {
        delete process.env[prop];
      }
    }
  });

  it('should set INPUT var for single string item', () => {
    env('INPUT', 'foo');
    expect(process.env['BUDDY_INPUT']).to.equal('foo');
  });
  it('should set INPUT var for multiple string items', () => {
    env('INPUT', ['foo', 'bar']);
    expect(process.env['BUDDY_INPUT']).to.equal('foo,bar');
  });
  it('should set INPUT var for single string item with id', () => {
    env('INPUT', 'foo', 'foo');
    expect(process.env['BUDDY_FOO_INPUT']).to.equal('foo');
  });
  it('should set INPUT var for single string item with illegal id', () => {
    env('INPUT', 'foo', 'f o-o');
    expect(process.env['BUDDY_FOO_INPUT']).to.equal('foo');
  });
  it('should set INPUT var for single file item', () => {
    env('INPUT', { filepath: path.join(process.cwd(), 'foo.js') });
    expect(process.env['BUDDY_INPUT']).to.equal('foo.js');
  });
  it('should set INPUT var for multiple file items', () => {
    env('INPUT', [{ filepath: path.join(process.cwd(), 'foo.js') }, { filepath: path.join(process.cwd(), 'bar.js') }]);
    expect(process.env['BUDDY_INPUT']).to.equal('foo.js,bar.js');
  });
  it('should set INPUT_HASH var for single string item', () => {
    env('INPUT_HASH', 'xxx');
    expect(process.env['BUDDY_INPUT_HASH']).to.equal('xxx');
  });
  it('should set INPUT_HASH var for multiple string items', () => {
    env('INPUT_HASH', ['xxx', 'yyy']);
    expect(process.env['BUDDY_INPUT_HASH']).to.equal('xxx,yyy');
  });
  it('should set INPUT_HASH var for single file item', () => {
    env('INPUT_HASH', { hash: 'xxx' });
    expect(process.env['BUDDY_INPUT_HASH']).to.equal('xxx');
  });
  it('should set INPUT_HASH var for multiple file items', () => {
    env('INPUT_HASH', [{ hash: 'xxx' }, { hash: 'yyy' }]);
    expect(process.env['BUDDY_INPUT_HASH']).to.equal('xxx,yyy');
  });
  it('should set INPUT_DATE var for single string item', () => {
    env('INPUT_DATE', '123');
    expect(process.env['BUDDY_INPUT_DATE']).to.equal('123');
  });
  it('should set INPUT_DATE var for multiple string items', () => {
    env('INPUT_DATE', ['123', '456']);
    expect(process.env['BUDDY_INPUT_DATE']).to.equal('123,456');
  });
  it('should set INPUT_DATE var for single file item', () => {
    env('INPUT_DATE', { date: '123' });
    expect(process.env['BUDDY_INPUT_DATE']).to.equal('123');
  });
  it('should set INPUT_DATE var for multiple file items', () => {
    env('INPUT_DATE', [{ date: '123' }, { date: '456' }]);
    expect(process.env['BUDDY_INPUT_DATE']).to.equal('123,456');
  });
  it('should set OUTPUT var for single string item', () => {
    env('OUTPUT', 'foo');
    expect(process.env['BUDDY_OUTPUT']).to.equal('foo');
  });
  it('should set OUTPUT var for multiple string items', () => {
    env('OUTPUT', ['foo', 'bar']);
    expect(process.env['BUDDY_OUTPUT']).to.equal('foo,bar');
  });
  it('should set OUTPUT var for single file item', () => {
    env('OUTPUT', { writepath: path.join(process.cwd(), 'foo.js') });
    expect(process.env['BUDDY_OUTPUT']).to.equal('foo.js');
  });
  it('should set OUTPUT var for multiple file items', () => {
    env('OUTPUT', [
      { writepath: path.join(process.cwd(), 'foo.js') },
      { writepath: path.join(process.cwd(), 'bar.js') }
    ]);
    expect(process.env['BUDDY_OUTPUT']).to.equal('foo.js,bar.js');
  });
  it('should set OUTPUT_HASH var for single string item', () => {
    env('OUTPUT_HASH', 'xxx');
    expect(process.env['BUDDY_OUTPUT_HASH']).to.equal('xxx');
  });
  it('should set OUTPUT_HASH var for multiple string items', () => {
    env('OUTPUT_HASH', ['xxx', 'yyy']);
    expect(process.env['BUDDY_OUTPUT_HASH']).to.equal('xxx,yyy');
  });
  it('should set OUTPUT_HASH var for single file item', () => {
    env('OUTPUT_HASH', { writeHash: 'xxx' });
    expect(process.env['BUDDY_OUTPUT_HASH']).to.equal('xxx');
  });
  it('should set OUTPUT_HASH var for multiple file items', () => {
    env('OUTPUT_HASH', [{ writeHash: 'xxx' }, { writeHash: 'yyy' }]);
    expect(process.env['BUDDY_OUTPUT_HASH']).to.equal('xxx,yyy');
  });
  it('should set OUTPUT_DATE var for single string item', () => {
    env('OUTPUT_DATE', '123');
    expect(process.env['BUDDY_OUTPUT_DATE']).to.equal('123');
  });
  it('should set OUTPUT_DATE var for multiple string items', () => {
    env('OUTPUT_DATE', ['123', '456']);
    expect(process.env['BUDDY_OUTPUT_DATE']).to.equal('123,456');
  });
  it('should set OUTPUT_DATE var for single file item', () => {
    env('OUTPUT_DATE', { writeDate: '123' });
    expect(process.env['BUDDY_OUTPUT_DATE']).to.equal('123');
  });
  it('should set OUTPUT_DATE var for multiple file items', () => {
    env('OUTPUT_DATE', [{ writeDate: '123' }, { writeDate: '456' }]);
    expect(process.env['BUDDY_OUTPUT_DATE']).to.equal('123,456');
  });
  it('should set OUTPUT_URL var for single string item', () => {
    env('OUTPUT_URL', 'foo.com');
    expect(process.env['BUDDY_OUTPUT_URL']).to.equal('foo.com');
  });
  it('should set OUTPUT_URL var for multiple string items', () => {
    env('OUTPUT_URL', ['foo.com', 'bar.com']);
    expect(process.env['BUDDY_OUTPUT_URL']).to.equal('foo.com,bar.com');
  });
  it('should set OUTPUT_URL var for single file item', () => {
    env('OUTPUT_URL', { writeUrl: 'foo.com' });
    expect(process.env['BUDDY_OUTPUT_URL']).to.equal('foo.com');
  });
  it('should set OUTPUT_URL var for multiple file items', () => {
    env('OUTPUT_URL', [{ writeUrl: 'foo.com' }, { writeUrl: 'bar.com' }]);
    expect(process.env['BUDDY_OUTPUT_URL']).to.equal('foo.com,bar.com');
  });
});
