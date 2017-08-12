if (process.env.RUNTIME != 'browser') {
  var foo = require('./foo.js');
  var c = require('./c.js');
}
var bing = require('./bar.js');