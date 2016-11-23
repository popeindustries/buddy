exports.build = {
  input: 'index.js',
  output: 'www/output.js',
  build: [{
    input: 'child.js',
    output: 'www/output-child.js'
  }]
};