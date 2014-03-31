// Project build configuration.
exports.build = {
  js: {
    // Directories containing potential js source files for this project ('node_modules' are added by default).
    sources: ['a/js/source/directory', 'another/js/source/directory'],
    // One or more js build targets.
    targets: [
      {
        // An entrypoint js (or equivalent) file to be wrapped in a module definition,
        // concatenated with all it's resolved dependencies.
        input: 'a/js/file',
        // A destination in which to save the processed input.
        // If a directory is specified, the input file name will be used.
        output: 'a/js/file/or/directory',
        // An alternate destination in which to save the compressed output.
        output_compressed: 'a/js/file/or/directory',
        // A script to run before a target is built.
        before: 'console.log(context); callback();',
        // A script to run after a target is built.
        after: './hooks/after.js',
        // A script to run after each output file is ready to be written to disk.
        afterEach: 'context.content = "foo"; callback();',
        // A flag indicating that require.js boilerplate be added to the output file
        boilerplate: true,
        // A flag indicating that the entry point module should require itself (bootstrap)
        bootstrap: true,
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
      }
    ]
  },
  css: {
    // Directories containing potential css source files for this project.
    sources: ['a/css/directory', 'another/css/directory'],
    // One or more css build targets
    targets: [
      {
        // An entrypoint css (or equivalent) file to be processed,
        // concatenated with all it's resolved dependencies.
        input: 'a/css/file',
        // A destination in which to save the processed input.
        // If a directory is specified, the input file name will be used.
        output: 'a/css/file/or/directory'
      },
      {
        // Files are batch processed when a directory is used as input,
        // though @import'ed dependencies are still resolved and inlined.
        input: 'a/css/directory',
        output: 'a/css/directory'
      }
    ]
  }
};

// Project dependency configuration.
exports.dependencies = {
  // A destination directory in which to place third-party library dependencies.
  // Alternatively, a destination file for packaging/minification
  'a/vendor/directory': {
    // An ordered list of dependencies
    sources: [
      // A github user/repo.
      // Install the 'browser-require' source when using Node-style modules.
      'popeindustries/browser-require',
      // A named library with or without version (ex: jquery@latest, backbone, backbone@1.0.0).
      // Version identifiers follow the npm semantic versioning rules.
      'library@version'
    ],
    // Dependencies can be packaged and minified to a destination file
    output: 'a/js/file'
  },
  // A destination directory in which to place source library dependencies.
  'a/source/directory': {
    sources: [
      // A github user/repo.
      // Will use the 'main' properties of
      // components.json or package.json to identify the file to install.
      'username/repo',
      // A github user/repo with specific file or directory locations.
      'username/repo#a/file/or/directory|another/file/or/directory',
      // A local file or directory to copy and install.
      '../a/file/or/directory'
    ]
  }
};

// Run a command after build
exports.script = 'command --flags';

// Configure webserver
exports.server = {
  // Defaults to project root
  directory: 'a/project/directory',
  // Defaults to 8080
  port: 8000
};