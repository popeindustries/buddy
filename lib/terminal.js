
module.exports = {
  RED: '0;31',
  YELLOW: '1;33',
  GREEN: '0;32',
  GREY: '0;90',
  silent: false,
  out: function(string, indentLevel) {
    if (indentLevel == null) indentLevel = 1;
    if (!this.silent) {
      return console.log(("" + ((new Array(indentLevel)).join('  '))) + string);
    }
  },
  colour: function(string, colourCode) {
    if (process.platform === 'win32') {
      return string;
    } else {
      return "\033[" + colourCode + "m" + string + "\033[0m";
    }
  }
};
