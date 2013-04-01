require.register('utils/util', function(module, exports, require) {
  module.exports = 'some util';
  
});
require.register('section/section', function(module, exports, require) {
  var Section, util;
  
  util = require('utils/util');
  
  module.exports = Section = (function() {
    function Section() {
      this.someVar = 'hey';
    }
  
    Section.prototype.someFunc = function() {
      return console.log(this.someVar);
    };
  
    return Section;
  
  })();
  
});
require.register('section/somesection', function(module, exports, require) {
  var Section, section, util;
  
  Section = require('./section');
  
  util = require('utils/util');
  
  section = new Section;
  
});