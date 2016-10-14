## Config settings

```js
// Project build configuration.
exports.build = [
  {
    // An entrypoint js (or equivalent) file to be concatenated with all it's resolved dependencies.
    input: 'a/js/file',
    // A destination in which to save the processed input.
    // If a directory is specified, the input file name will be appended.
    output: 'a/js/file/or/directory',
    // An alternate destination in which to save the compressed output.
    output_compressed: 'a/js/file/or/directory',
    // A flag indicating that the entry point module should be lazily evaluated.
    bootstrap: false,
    // A target js version to transpile to.
    // All required Babel plugins will be automatically downloaded and installed.
    version: 'es5',
    // Plugin configuration.
    options: {
      babel: {
        // A Babel plugin to load and/or configure.
        plugins: [['babel-plugin-transform-es2015-classes', { loose: false }]]
      },
      uglify: {
        // Configure uglify-js behaviour.
        compress: {
          join_vars: true
        }
      }
    }
    // Builds can have children.
    // Any sources included in the parent target will NOT be included in the child.
    build: [
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
    // Skip concatenation.
    bundle: false,
    version: 'node6'
  },
  {
    // Files are only watched when no output is specified.
    // Glob patterns are allowed.
    input: 'a/collection/of/{server,shared}/files/*.*',
    // Add a label for easy filtering when using `--grep`.
    label: 'server'
  },
  {
    // An entrypoint css (or equivalent) file to be processed,
    // concatenated with all it's resolved dependencies.
    input: 'a/css/file',
    // A destination in which to save the processed input.
    // If a directory is specified, the input file name will be appended.
    output: 'a/css/file/or/directory',
    // An Autoprefixer target version.
    version: 'last 5 versions',
    // Plugin configuration.
    options: {
      postcss: {
        // A postcss plugin to load (will download and install automatically).
        plugins: ['postcss-cssnext']
      }
    }
  },
  {
    // Files are batch processed when a directory is used as input,
    // though @import'ed dependencies are still resolved and inlined.
    input: 'a/css/directory',
    output: 'a/css/directory'
  },
  {
    // An entrypoint html (or equivalent) file to be processed.
    input: 'an/html/template/file',
    // A destination in which to save the processed input.
    // If a directory is specified, the input file name will be appended.
    output: 'an/html/file/or/directory'
  },
  {
    // A directory of images (gif/png/jpg/svg) to be processed (copied, compressed).
    input: 'an/image/directory',
    output: 'a/deploy/directory'
  }
];

// Run a command after build.
exports.script = 'command --flags';

// Configure development webserver.
exports.server = {
  // Directory containing static files to serve (defaults to project root; exposed as process.env.ROOT).
  directory: 'a/project/directory',
  // Alternatively, pass a file reference to start a custom application server
  file: 'a/file',
  // A port number (defaults to 8080; exposed as process.env.PORT).
  port: 8000,
  // Flags to pass to the Node process that runs the custom application server.
  flags: ['--inspect'],
  // Environment variables to pass to the custom application server.
  env: {
    NODE_ENV: 'development',
    DEBUG: 'app*'
  }
};
```