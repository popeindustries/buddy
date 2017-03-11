'use strict';

const Event = require('events');
const fs = require('fs');
const http = require('http');
const path = require('path');
const StaticServer = require('node-static').Server;
const url = require('url');

const PORT = 8080;

/**
 * Server factory
 * @param {String} [directory]
 * @param {Number} [port]
 * @param {Object} [headers]
 * @param {Array} [extraDirectories]
 * @returns {Server}
 */
module.exports = function ServerFactory (directory, port, headers, extraDirectories) {
  return new Server(directory, port, headers, extraDirectories);
};

class Server extends Event {
  /**
   * Constructor
   * @param {String} [directory]
   * @param {Number} [port]
   * @param {Object} [headers]
   * @param {Array} [extraDirectories]
   */
  constructor (directory, port, headers = {}, extraDirectories = []) {
    super();

    this.cwd = process.cwd();
    this.config = {
      cache: 0,
      headers
    };
    // Paths must be relative to cwd
    this.directories = [directory || this.cwd, ...extraDirectories].map((directory) => {
      return ~directory.indexOf(this.cwd)
        ? path.relative(this.cwd, directory)
        : directory;
    });
    this.port = port || PORT;
    this.server = null;
  }

  /**
   * Begin listening
   * @param {Function} fn(err)
   */
  start (fn) {
    const fileServer = new StaticServer(this.cwd, this.config);

    this.server = http.createServer((req, res) => {
      let uri = url.parse(req.url, true).pathname;
      const isFile = !!path.extname(uri).length;

      if (!isFile) uri = path.join(uri, 'index.html');

      for (const directory of this.directories) {
        const filepath = path.join(directory, uri);

        if (fs.existsSync(filepath)) return fileServer.serveFile(filepath, 200, {}, req, res);
      }

      res.writeHead('404', this.config.headers);
      res.end();
    }).listen(this.port, fn);
  }

  /**
   * Close server
   */
  close () {
    try {
      this.server.close();
    } catch (err) { /* ignore */}
  }
}