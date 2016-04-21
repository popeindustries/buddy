## Config settings

```js
// Project build configuration.
exports.build = {
  // Directories containing potential source files for this project ('node_modules' are added by default).
  sources: ['a/js/source/directory', 'a/css/source/directory'],
  // One or more build targets.
  targets: [
    {
      // An entrypoint js (or equivalent) file to be wrapped in a module definition,
      // concatenated with all it's resolved dependencies.
      input: 'a/js/file',
      // A destination in which to save the processed input.
      // If a directory is specified, the input file name will be appended.
      output: 'a/js/file/or/directory',
      // An alternate destination in which to save the compressed output.
      output_compressed: 'a/js/file/or/directory',
      // A script to run before a target is built.
      before: 'console.log(context); done();',
      // A script to run after a target is built.
      after: './hooks/after.js',
      // A script to run after each output file is ready to be written to disk.
      afterEach: 'context.content = "foo"; done();',
      // A flag indicating that the entry point module should be lazily evaluated
      bootstrap: false,
      // Targets can have children.
      // Any sources included in the parent target will NOT be included in the child.
      targets: [
        {
          input: 'a/js/file',
          output: 'a/js/file/or/directory'
        }
      ]
    },
    {
      // Files are batch processed when a directory is used as input.
      input: 'a/js/directory',
      output: 'a/js/directory',
      // Skips module wrapping (ex: for use in server environments).
      modular: false
    },
    {
      // Files are only watched when no output is specified.
      // Glob patterns are allowed
      input: 'a/collection/of/{server,shared}/files/*.*',
      // Add a label for easy filtering when using --grep
      label: 'server'
    },
    {
      // An entrypoint css (or equivalent) file to be processed,
      // concatenated with all it's resolved dependencies.
      input: 'a/css/file',
      // A destination in which to save the processed input.
      // If a directory is specified, the input file name will be appended.
      output: 'a/css/file/or/directory'
    },
    {
      // Files are batch processed when a directory is used as input,
      // though @import'ed dependencies are still resolved and inlined.
      input: 'a/css/directory',
      output: 'a/css/directory'
    },
    {
      // An entrypoint html (or equivalent) file to be processed
      input: 'an/html/template/file',
      // A destination in which to save the processed input.
      // If a directory is specified, the input file name will be appended.
      output: 'an/html/file/or/directory'
    },
    {
      // A directory of images (gif/png/jpg/svg) to be processed (compressed)
      input: 'an/image/directory',
      output: 'a/deploy/directory'
    }
  ]
};

// Run a command after build
exports.script = 'command --flags';

// Configure webserver
exports.server = {
  // Directory containing static files to serve (defaults to project root; exposed as process.env.ROOT)
  directory: 'a/project/directory',
  // Alternatively, pass a file reference to start a custom application server
  file: 'a/file',
  // Specify port number (defaults to 8080; exposed as process.env.PORT)
  port: 8000,
  // Environment variables to pass to server
  env: {
    NODE_ENV: 'test',
    DEBUG: 'app*'
  }
};
```