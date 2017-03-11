'use strict';

const { ReloadServerFactory, ServerFactory } = require('..');
const { client: WSClient } = require('websocket');
const path = require('path');
const expect = require('expect.js');
const request = require('request');

describe('buddy-server', () => {
  before(() => {
    process.chdir(path.resolve(__dirname, 'fixtures'));
  });

  describe('server', () => {
    before((done) => {
      this.server = ServerFactory('www', 8000, { 'X-Hello': 'World!' }, [path.resolve('assets')]);
      this.server.start(done);
    });
    after(() => {
      this.server.close();
    });

    it('should implicitly serve index.html', (done) => {
      request('http://localhost:8000/', (err, res, body) => {
        expect(res.statusCode).to.eql(200);
        expect(body).to.contain('<!doctype html>');
        done();
      });
    });
    it('should serve a css file with correct mime type', (done) => {
      request('http://localhost:8000/style.css', (err, res, body) => {
        expect(res.statusCode).to.eql(200);
        expect(res.headers['content-type']).to.eql('text/css');
        done();
      });
    });
    it('should serve a js file with correct mime type', (done) => {
      request('http://localhost:8000/script.js', (err, res, body) => {
        expect(res.statusCode).to.eql(200);
        expect(res.headers['content-type']).to.eql('application/javascript');
        done();
      });
    });
    it('should serve a font file with correct mime type', (done) => {
      request('http://localhost:8000/font.woff', (err, res, body) => {
        expect(res.statusCode).to.eql(200);
        expect(res.headers['content-type']).to.eql('application/font-woff');
        done();
      });
    });
    it('should serve a json file with correct mime type', (done) => {
      request('http://localhost:8000/test.json', (err, res, body) => {
        expect(res.statusCode).to.eql(200);
        expect(res.headers['content-type']).to.eql('application/json');
        done();
      });
    });
    it('should serve files from additional directories', (done) => {
      request('http://localhost:8000/index.css', (err, res, body) => {
        expect(res.statusCode).to.eql(200);
        expect(res.headers['content-type']).to.eql('text/css');
        expect(body).to.equal('body {\n  background-color: white;\n}');
        done();
      });
    });
    it('should return 404 for missing file', (done) => {
      request('http://localhost:8000/not.css', (err, res, body) => {
        expect(res.statusCode).to.eql(404);
        done();
      });
    });
    it('should send custom headers', (done) => {
      request('http://localhost:8000/', (err, res, body) => {
        expect(res.statusCode).to.eql(200);
        expect(res.headers).to.have.property('x-hello', 'World!');
        done();
      });
    });
  });

  describe('reload server', () => {
    before((done) => {
      this.reload = ReloadServerFactory();
      this.reload.start(done);
    });
    after(() => {
      this.reload.close();
    });

    it('should serve the livereload.js file with correct mime type', (done) => {
      request('http://localhost:35729/livereload.js', (err, res, body) => {
        expect(res.statusCode).to.eql(200);
        expect(res.headers['content-type']).to.eql('application/javascript');
        done();
      });
    });
    it('should return 404 for all other content', (done) => {
      request('http://localhost:35729/not.here', (err, res, body) => {
        expect(res.statusCode).to.eql(404);
        done();
      });
    });
    it('should open a socket connection', (done) => {
      const client = new WSClient();

      client.on('connect', (connection) => {
        client.abort();
        done();
      });
      client.connect('ws://localhost:35729');
    });
  });
});
