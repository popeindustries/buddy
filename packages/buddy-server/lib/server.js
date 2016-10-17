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
 * @returns {Server}
 */
module.exports = function ServerFactory (directory, port) {
  return new Server(directory, port);
};

class Server extends Event {
  /**
   * Constructor
   * @param {String} [directory]
   * @param {Number} [port]
   */
  constructor (directory, port) {
    super();

    this.directory = path.resolve(directory) || process.cwd();
    this.port = port || PORT;
    this.server = null;
  }

  /**
   * Begin listening
   * @param {Function} fn(err)
   */
  start (fn) {
    const fileServer = new StaticServer(this.directory, { cache: 0 });
    const hasIndex = fs.existsSync(path.resolve(this.directory, 'index.html'));

    this.server = http.createServer((req, res) => {
      fileServer.serve(req, res, (err, resp) => {
        if (err) {
          if (err.status == '404') {
            const uri = url.parse(req.url, true).pathname;
            const filename = path.join(this.directory, uri);
            const isFile = !!path.extname(filename).length;
            const paths = uri.split('/');
            let p, n;

            if (isFile) {
              // Walk to root
              while (paths.length > 1) {
                paths.shift();
                p = '/' + paths.join('/');
                n = path.join(this.directory, p);
                if (fs.existsSync(n)) return fileServer.serveFile(p, 200, {}, req, res);
              }
            } else if (hasIndex) {
              // Serve index
              return fileServer.serveFile('/index.html', 200, {}, req, res);
            }
          }

          res.writeHead(err.status, err.headers);
          res.end();
        }
      });
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