module.exports = {
  test: {
    build: {
      input: 'test.js',
      output: 'www'
    }
  },
  production: {
    build: {
      input: 'production.js',
      output: 'www'
    }
  }
};
