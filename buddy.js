// Project build configuration.
exports.build = {
  js: {
    // Directories containing potential js source files for this project.
    sources: ['a/coffeescript/source/directory', 'a/js/source/directory'],
    // One or more js build targets.
    targets: [
      {
        // An entrypoint js (or equivalent) file to be wrapped in a module definition,
        // concatenated with all it's resolved dependencies.
        input: 'a/coffeescript/or/js/file',
        // A destination in which to save the processed input.
        // If a directory is specified, the input file name will be used.
        output: 'a/js/file/or/directory',
        // Targets can have children.
        // Any sources included in the parent target will NOT be included in the child.
        targets: [
          {
            input: 'a/coffeescript/or/js/file',
            output: 'a/js/file/or/directory'
          }
        ]
      },
      {
        // Files are batch processed when a directory is used as input.
        input: 'a/coffeescript/or/js/directory',
        output: 'a/js/directory',
        // Skips module wrapping (ex: for use in server environments).
        modular: false
      }
    ]
  },
  css: {
    // Directories containing potential css source files for this project.
    sources: ['a/stylus/directory', 'a/less/directory', 'a/css/directory'],
    // One or more css build targets
    targets: [
      {
        // An entrypoint css (or equivalent) file to be processed,
        // concatenated with all it's resolved dependencies.
        input: 'a/stylus/less/or/css/file',
        // A destination in which to save the processed input.
        // If a directory is specified, the input file name will be used.
        output: 'a/css/file/or/directory'
      },
      {
        // Files are batch processed when a directory is used as input.
        input: 'a/stylus/less/or/css/directory',
        output: 'a/css/directory'
      }
    ]
  }
}

// Project dependency configuration.
exports.dependencies = {
  // A destination directory in which to place third-party library dependencies.
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
      // Will use the 'main' or 'scripts' properties of
      // components.json or package.json to identify the file to install.
      'username/repo',
      // A github user/repo with specific file or directory locations.
      'username/repo#a/file/or/directory|another/file/or/directory',
      // A local file or directory to copy and install.
      'a/file/or/directory'
    ]
  }
}

// Project settings configuration.
exports.settings = {
  // Run a command after build
  test: 'command --flags',
  // Override the default processors, and/or include custom processors.
  processors: {
    js: {
      // Append one or more js compilers to the default 'coffeescript'.
      compilers: ['a/file', 'another/file'],
      // Change the default 'uglifyjs' compressor to a custom specification.
      compressor: 'a/file',
      // Change the default 'jshint' linter to a custom specification.
      linter: 'a/file',
      // Change the default 'node' module type to 'amd' or a custom specification.
      module: 'amd'
    },
    css: {
      // Append one or more css compilers to the default 'stylus' and 'less'.
      compilers: ['a/file', 'another/file'],
      // Change the default 'cleancss' compressor to a custom specification.
      compressor: 'a/file',
      // Change the default 'csslint' linter to a custom specification.
      linter: 'a/file'
    }
  }
}