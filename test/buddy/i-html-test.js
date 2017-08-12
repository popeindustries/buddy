const buddyFactory = require('../../lib/buddy');
const expect = require('expect.js');
const fs = require('fs');
const path = require('path');
const rimraf = require('rimraf');
let buddy;

describe('HTML', () => {
  before(() => {
    process.chdir(path.resolve(__dirname, 'fixtures/buddy/build'));
  });
  beforeEach(() => {
    buddy = null;
    process.env.NODE_ENV = 'test';
  });
  afterEach(() => {
    if (buddy) buddy.destroy();
    rimraf.sync(path.resolve('output'));
  });
  after(() => {
    ['yarn.lock', 'node_modules', 'package.json'].forEach(p => {
      if (fs.existsSync(path.resolve(p))) rimraf.sync(path.resolve(p));
    });
  });

  it('should build an html file with inline css dependency', done => {
    buddy = buddyFactory({
      input: 'a.html',
      output: 'output'
    });
    buddy.build((err, filepaths) => {
      expect(fs.existsSync(filepaths[0])).to.be(true);
      const content = fs.readFileSync(filepaths[0], 'utf8');

      expect(content).to.equal(
        '<!DOCTYPE html>\n<html>\n<head>\n  <title></title>\n  <style>body {\n  color: white;\n  font-size: 12px;\n}\nbody p {\n  font-size: 10px;\n}\n</style>\n</head>\n<body>\n\n</body>\n</html>'
      );
      done();
    });
  });
  it('should build an html file with inline js dependency', done => {
    buddy = buddyFactory({
      input: 'b.html',
      output: 'output'
    });
    buddy.build((err, filepaths) => {
      expect(fs.existsSync(filepaths[0])).to.be(true);
      const content = fs.readFileSync(filepaths[0], 'utf8');

      expect(content).to.equal(
        "<!DOCTYPE html>\n<html>\n<head>\n  <title></title>\n  <script>var f = 'f';</script>\n</head>\n<body>\n\n</body>\n</html>"
      );
      done();
    });
  });
  it('should build an html file with inline js dependency needing env substitution', done => {
    buddy = buddyFactory({
      input: 'c.html',
      output: 'output'
    });
    buddy.build((err, filepaths) => {
      expect(fs.existsSync(filepaths[0])).to.be(true);
      const content = fs.readFileSync(filepaths[0], 'utf8');

      expect(content).to.equal(
        "<!DOCTYPE html>\n<html>\n<head>\n  <title></title>\n  <script>var boop = this\n  , isDev = 'test' == 'development';\n\nconsole.log('is dev: ', isDev);</script>\n</head>\n<body>\n\n</body>\n</html>"
      );
      done();
    });
  });
});
