
exports.RED = 31;

exports.GREEN = 32;

exports.GREY = 90;

exports.out = function(string, indentLevel) {
  if (indentLevel == null) indentLevel = 1;
  return console.log(("" + ((new Array(indentLevel)).join('  '))) + string);
};

exports.colour = function(string, colourCode) {
  return "\033[" + colourCode + "m" + string + "\033[0m";
};
