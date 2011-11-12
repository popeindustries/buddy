
module.exports = {
  RED: 31,
  GREEN: 32,
  GREY: 90,
  silent: false,
  out: function(string, indentLevel) {
    if (indentLevel == null) indentLevel = 1;
    if (!this.silent) {
      return console.log(("" + ((new Array(indentLevel)).join('  '))) + string);
    }
  },
  colour: function(string, colourCode) {
    return "\033[" + colourCode + "m" + string + "\033[0m";
  }
};
