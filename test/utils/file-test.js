'use strict';

const { appendContent, prependContent, replaceContent } = require('../../lib/utils/file');
const { expect } = require('chai');
const sourceMap = require('../../lib/utils/sourceMap');
const path = require('path');

let file;

function createFile(content = '') {
  return {
    content,
    hasMaps: true,
    totalLines: content !== '' ? content.split('\n').length : 0,
    map: sourceMap.create(content)
  };
}

describe('file', () => {
  before(() => {
    process.chdir(path.resolve(__dirname, 'fixtures'));
  });
  beforeEach(() => {
    file = createFile('//foo');
  });

  describe('appendContent()', () => {
    it('should append a text chunk', () => {
      appendContent(file, 'var bar = "bar";');
      expect(file.content).to.equal('//foo\nvar bar = "bar";');
      expect(file.totalLines).to.equal(2);
    });
    it('should append a multiline text chunk', () => {
      appendContent(file, 'var bar = "bar";\nvar foo = "foo";');
      expect(file.content).to.equal('//foo\nvar bar = "bar";\nvar foo = "foo";');
      expect(file.totalLines).to.equal(3);
    });
    it('should append a file chunk', () => {
      const file2 = createFile('var bar = "bar";');

      appendContent(file, file2);
      expect(file.content).to.equal('//foo\nvar bar = "bar";');
      expect(file.totalLines).to.equal(2);
      expect(file.map.toJSON()).to.have.property('mappings', 'AAAA;AAAA');
    });
    it('should append a multiline file chunk', () => {
      const file2 = createFile('var bar = "bar";\n\nvar foo = "foo";');

      appendContent(file, file2);
      expect(file.content).to.equal('//foo\nvar bar = "bar";\n\nvar foo = "foo";');
      expect(file.totalLines).to.equal(4);
      expect(file.map.toJSON()).to.have.property('mappings', 'AAAA;AAAA;;AAEA');
    });
  });

  describe('prependContent()', () => {
    it('should prepend a text chunk', () => {
      prependContent(file, 'var bar = "bar";');
      expect(file.content).to.equal('var bar = "bar";\n//foo');
      expect(file.totalLines).to.equal(2);
    });
    it('should prepend a multiline text chunk', () => {
      prependContent(file, 'var bar = "bar";\nvar foo = "foo";');
      expect(file.content).to.equal('var bar = "bar";\nvar foo = "foo";\n//foo');
      expect(file.totalLines).to.equal(3);
    });
    it('should prepend a file chunk', () => {
      const file2 = createFile('var bar = "bar";');

      prependContent(file, file2);
      expect(file.content).to.equal('var bar = "bar";\n//foo');
      expect(file.totalLines).to.equal(2);
      expect(file.map.toJSON()).to.have.property('mappings', 'AAAA;AAAA');
    });
    it('should prepend a multiline file chunk', () => {
      const file2 = createFile('var bar = "bar";\n\nvar foo = "foo";');

      prependContent(file, file2);
      expect(file.content).to.equal('var bar = "bar";\n\nvar foo = "foo";\n//foo');
      expect(file.totalLines).to.equal(4);
      expect(file.map.toJSON()).to.have.property('mappings', 'AAAA;;AAEA;AAFA');
    });
  });

  describe('replaceContent()', () => {
    it('should replace a text string with content', () => {
      replaceContent(file, 'foo', 2, 'bar');
      expect(file.content).to.equal('//bar');
    });
    it('should replace a text string with multiline content', () => {
      replaceContent(file, 'foo', 2, 'bar\nfoo');
      expect(file.content).to.equal('//bar\nfoo');
    });
    it('should replace a text string with file content', () => {
      const file2 = createFile('var bar = "bar";');

      replaceContent(file, 'foo', 2, file2);
      expect(file.content).to.equal('//var bar = "bar";');
    });
    it('should replace a text string with multiline file content', () => {
      const file2 = createFile('var bar = "bar";\n\nvar foo = "foo";');

      replaceContent(file, 'foo', 2, file2);
      expect(file.content).to.equal('//var bar = "bar";\n\nvar foo = "foo";');
      expect(file.map.toJSON()).to.have.property('mappings', 'AAAA;;AAEA');
    });
    it('should batch replace a text strings with content', () => {
      replaceContent(file, [['//', 0, '**'], ['foo', 2, 'bar']]);
      expect(file.content).to.equal('**bar');
    });
  });
});
