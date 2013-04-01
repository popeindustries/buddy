require.register('wrapped', function(module, exports, require) {
  return exports.func = function() {
    var myVar;

    myVar = 'hey';
    return console.log(myVar);
  };
});
