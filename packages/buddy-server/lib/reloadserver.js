'use strict';

const { server: WSServer } = require('websocket');
const ConnectionFactory = require('./reloadconnection');
const Event = require('events');
const filed = require('filed');
const http = require('http');
const path = require('path');
const url = require('url');

const PORT = 35729;

/**
 * ReloadConnection factory
 * @returns {ReloadServer}
 */
module.exports = function ReloadServerFactory () {
  return new ReloadServer();
};

class ReloadServer extends Event {
  /**
   * Constructor
   */
  constructor () {
    super();

    this.options = {
      id: 'com.popeindustries.buddy',
      name: 'buddy-livereload',
      version: '1.0',
      port: PORT
    };
    this.port = this.options.port;
    this.connections = {};
    this.connectionId = 0;
    this.server = null;
    this.wsServer = null;
  }

  /**
   * Start server
   * @param {Function} fn(err)
   */
  start (fn) {
    this.server = http.createServer((req, res) => {
      const uri = url.parse(req.url, true);
      let file;

      // Serve livereload.js file
      if (uri.pathname == '/livereload.js') {
        file = filed(path.join(__dirname, '../vendor/livereload.js'));
        file.pipe(res);
      // All other requests 404
      } else {
        res.writeHead(404);
        res.end();
      }
    });

    // Create socket server
    this.wsServer = new WSServer({
      httpServer: this.server,
      autoAcceptConnections: true
    });
    this.wsServer.on('connect', (socket) => {
      this._createConnection(socket);
    });

    // Listen
    this.server.listen(this.port, fn);
  }

  /**
   * Get all active connections
   * @returns {Arrray}
   */
  activeConnections () {
    let connections = [];
    let connection;

    for (const id in this.connections) {
      connection = this.connections[id];
      if (connection.isActive()) connections.push(connection);
    }

    return connections;
  }

  /**
   * Close server
   */
  close () {
    for (const connection in this.connections) {
      connection.close();
    }

    try {
      this.wsServer.shutDown();
      this.server.close();
    } catch (err) { /* ignore */}

    this.connections = {};
  }

  /**
   * Create connection instance
   * @param {Object} socket
   * @returns {ReloadConnection}
   */
  _createConnection (socket) {
    const connection = ConnectionFactory(socket, `buddy${++this.connectionId}`, this.options);

    connection.on('connected', () => {
      this.connections[connection.id] = connection;
      this.emit('connected', connection);
    });
    connection.on('disconnected', () => {
      delete this.connections[connection.id];
      this.emit('disconnected', connection);
    });
    connection.on('command', (command) => {
      this.emit('command', command);
    });
    connection.on('error', (err) => {
      this.emit('error', err);
    });

    return connection;
  }
}