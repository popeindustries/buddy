// Nothing = require('./nonexistant')
var Class;

module.exports = Class = (function() {

  function Class() {
    this.someVar = 'hey';
  }

  Class.prototype.someFunc = function() {
    return console.log(this.someVar);
  };

  return Class;

})();