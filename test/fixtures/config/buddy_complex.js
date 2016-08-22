module.exports = {
  build: [
    {
      input: 'a.js',
      output: 'www',
      sources: [],
      version: 'es5',
      options: {

      },
      build: [
        {
          input: 'b.js',
          output: 'www'
        },
        {
          input: 'c.js',
          output: 'www',
          build: {
            input: 'd.js',
            output: 'www'
          }
        }
      ]
    },
    {
      input: 'a.js',
      output: 'dist',
      version: 'node4',
      bundle: false
    }
  ],
  server: {
    port: 3000
  }
};