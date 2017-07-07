'use strict';

const { create } = require('../../lib/utils/sourceMap');
const expect = require('expect.js');
const fs = require('fs');
const path = require('path');

describe('sourceMap', () => {
  before(() => {
    process.chdir(path.resolve(__dirname, 'fixtures'));
  });

  describe('create()', () => {
    it('should create a source map from file content and url', () => {
      const map = create(fs.readFileSync(path.resolve('foo.js'), 'utf8'), 'foo.js');

      expect(map.toString()).to.equal('{"version":3,"sources":["foo.js"],"names":[],"mappings":"AAAA;;AAEA;AACA;;AAEA;;AAEA;AACA;AACA","file":"foo.js","sourcesContent":["\'use strict\';\\n\\nconst foo = require(\'foo\');\\nconst bar = require(\'bar\');\\n\\nconst FOO = \'FOO\';\\n\\nmodule.exports = function foo () {\\n  console.log(foo || FOO);\\n};"]}');
    });
    it('should create a source map from file content with default url', () => {
      const map = create(fs.readFileSync(path.resolve('foo.js'), 'utf8'));

      expect(map.toJSON()).to.have.property('file', '<source>');
    });
  });

  it('should createFromMap()');
  it('should clone()');
  it('should append()');
  it('should prepend()');
  it('should insert()');
});
