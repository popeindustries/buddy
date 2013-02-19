exports.build = {
  js: {
    sources: ['a/coffeescript/source/directory', 'a/js/source/directory', '!a/js/source/directory/ignored'],
    targets: [
      {
        input: 'a/coffeescript/or/js/file',
        output: 'a/js/file/or/directory',
        output_compressed: 'a/js/file/or/directory'
      },
      {
        input: 'a/coffeescript/or/js/directory',
        output: 'a/js/directory',
        modular: false
      }
    ]
  },
  css: {
    sources: ['a/stylus/directory', 'a/less/directory', 'a/css/directory'],
    targets: [
      {
        input: 'a/stylus/less/or/css/file',
        output: 'a/css/file/or/directory'
      },
      {
        input: 'a/stylus/less/or/css/directory',
        output: 'a/css/directory'
      }
    ]
  }
}

exports.dependencies = {
  'a/vendor/directory': {
    sources: [
      'popeindustries/browser-require',
      'library@version'
    ],
    output: 'a/js/file'
  }
}

exports.settings = {
  test: 'command --flags',
  processors: {
    js: {
      compilers: ['a/file', 'another/file'],
      compressor: 'a/file',
      linter: 'a/file',
      module: 'amd'
    }
  }
}