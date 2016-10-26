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
      this.server = ServerFactory('www', 8000);
      this.server.start(done);
    });
    after(() => {
      this.server.close();
    });

    it('it should implicitly serve index.html', (done) => {
      request('http://localhost:8000/', (err, res, body) => {
        expect(res.statusCode).to.eql(200);
        expect(body).to.contain('<!doctype html>');
        done();
      });
    });
    it('it should serve a css file with correct mime type', (done) => {
      request('http://localhost:8000/style.css', (err, res, body) => {
        expect(res.statusCode).to.eql(200);
        expect(res.headers['content-type']).to.eql('text/css');
        done();
      });
    });
    it('it should serve a js file with correct mime type', (done) => {
      request('http://localhost:8000/script.js', (err, res, body) => {
        expect(res.statusCode).to.eql(200);
        expect(res.headers['content-type']).to.eql('application/javascript');
        done();
      });
    });
    it('it should serve a font file with correct mime type', (done) => {
      request('http://localhost:8000/font.woff', (err, res, body) => {
        expect(res.statusCode).to.eql(200);
        expect(res.headers['content-type']).to.eql('application/font-woff');
        done();
      });
    });
    it('it should serve a json file with correct mime type', (done) => {
      request('http://localhost:8000/test.json', (err, res, body) => {
        expect(res.statusCode).to.eql(200);
        expect(res.headers['content-type']).to.eql('application/json');
        done();
      });
    });
    it('it should return 404 for missing file', (done) => {
      request('http://localhost:8000/not.css', (err, res, body) => {
        expect(res.statusCode).to.eql(404);
        done();
      });
    });
    it('it should reroute to root when a missing directory is requested', (done) => {
      request('http://localhost:8000/something', (err, res, body) => {
        expect(res.statusCode).to.eql(200);
        expect(res.req.path).to.eql('/something');
        done();
      });
    });
    it('it should handle rerouted files when a missing directory is requested', (done) => {
      request('http://localhost:8000/something/style.css', (err, res, body) => {
        expect(res.statusCode).to.eql(200);
        expect(res.req.path).to.eql('/something/style.css');
        done();
      });
    });
    it('it should handle rerouted nested files when a missing directory is requested', (done) => {
      request('http://localhost:8000/something/nested/style.css', (err, res, body) => {
        expect(res.statusCode).to.eql(200);
        expect(res.req.path).to.eql('/something/nested/style.css');
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

    it('it should serve the livereload.js file with correct mime type', (done) => {
      request('http://localhost:35729/livereload.js', (err, res, body) => {
        expect(res.statusCode).to.eql(200);
        expect(res.headers['content-type']).to.eql('application/javascript');
        done();
      });
    });
    it('it should return 404 for all other content', (done) => {
      request('http://localhost:35729/not.here', (err, res, body) => {
        expect(res.statusCode).to.eql(404);
        done();
      });
    });
    it('it should open a socket connection', (done) => {
      const client = new WSClient();

      client.on('connect', (connection) => {
        client.abort();
        done();
      });
      client.connect('ws://localhost:35729');
    });
  });
});
