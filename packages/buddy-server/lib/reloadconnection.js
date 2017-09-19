'use strict';

const Event = require('events');
const Parser = require('livereload-protocol');

const TIMEOUT = 1000;

/**
 * ReloadConnection factory
 * @param {Object} socket
 * @param {String} id
 * @param {Object} options
 * @returns {ReloadConnection}
 */
module.exports = function ReloadConnectionFactory (socket, id, options) {
  return new ReloadConnection(socket, id, options);
};

class ReloadConnection extends Event {
  /**
   * Constructor
   * @param {Object} socket
   * @param {String} id
   * @param {Object} options
   */
  constructor (socket, id, options) {
    super();

    let timeoutID = null;

    this.socket = socket;
    this.id = id;
    this.parser = new Parser('server', {
      monitoring: [Parser.protocols.MONITORING_7],
      conncheck: [Parser.protocols.CONN_CHECK_1],
      saving: [Parser.protocols.SAVING_1]
    });

    // Register for socket events
    this.socket.on('message', (data) => {
      this.parser.received(data.utf8Data);
    });
    this.socket.on('close', () => {
      if (timeoutID) clearTimeout(timeoutID);
      this.emit('disconnected');
    });
    this.socket.on('error', (err) => {
      this.socket.close();
      this.emit('error', err);
    });

    // Register for parser events
    this.parser.on('command', (command) => {
      if (command.command === 'ping') {
        this.send({ command: 'pong', token: command.token });
      } else {
        this.emit('command', command);
      }
    });
    this.parser.on('connected', () => {
      if (timeoutID) clearTimeout(timeoutID);
      this.send(this.parser.hello(options));
      this.emit('connected');
    });

    // Start handshake timeout
    timeoutID = setTimeout(() => {
      timeoutID = null;
      this.close();
    }, TIMEOUT);
  }

  /**
   * Get active state
   * @returns {Boolean}
   */
  isActive () {
    if (this.parser.negotiatedProtocols != null) {
      return this.parser.negotiatedProtocols.monitoring >= 7;
    }
  }

  /**
   * Send 'msg' to client
   * @param {Object} msg
   */
  send (msg) {
    this.parser.sending(msg);
    this.socket.send(JSON.stringify(msg));
  }

  /**
   * Close connection
   */
  close () {
    this.socket.close();
  }
}