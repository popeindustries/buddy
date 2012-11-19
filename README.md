# buddy(1)

**buddy(1)** is a build tool for js/css projects. It helps you manage third-party dependencies, compiles source code from higher order js/css languages (coffeescript/stylus/less), automatically wraps js files in module definitions, statically resolves module dependencies, and concatenates (and optionally compresses) all souces into a single file for more efficient delivery to the browser.

**Current version:** 0.5.2
*[the 0.5.x branch is not backwards compatible with earlier versions. See [#changelog](Change Log) below for more details]*

## Installation

Use the *-g* global flag to make the **buddy(1)** command available system-wide:

```bash
$ npm -g install buddy
```

Or, optionally, add **buddy** as a dependency in your project's *package.json* file:

```json
{
  "name": "myproject",
  "description": "This is my web project",
  "version": "0.0.1",
  "dependencies": {
    "buddy": "0.5.0"
  },
  "scripts": {
    "install": "buddy install",
    "build": "buddy build",
    "deploy": "buddy deploy"
  }
}
```

...then install:

```bash
$ cd path/to/project
$ npm install
```

## Usage

```bash
$ cd path/to/project

# When buddy is installed globally:
# install dependencies
$ buddy install
# build all source files
$ buddy build
# build and compress all source files
$ buddy -c build
# build and lint all source files
$ buddy -l build
# watch and build on source changes
$ buddy watch
# build and compress for production
$ buddy deploy
# view usage, examples, and options
$ buddy --help

# When buddy is installed locally:
# ...if scripts parameter defined in package.json
$ npm run-script install
# ...if called directly
$ ./node_modules/buddy/bin/buddy install
```

### Configuration

The only requirement for adding **buddy** support to a project is the presence of a **buddy.js** file in your project root:

```js
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
      // A git url.
      // Install the 'browser-require' source when using Node modules.
      'git://github.com/popeindustries/browser-require.git',
      // A named library with or without version (ex: jquery#latest, backbone, backbone#1.0.0).
      // Version identifiers follow the npm semantic versioning rules.
      'library#version'
    ],
    // Dependencies can be packaged and minified to a destination file
    output: 'a/js/file'
  },
  // A destination directory in which to place source library dependencies.
  'a/source/directory': {
    sources: [
      // A git url.
      // Will use the 'main' property of package.json to identify the file to install.
      'git://github.com/username/project.git',
      // A git url with a specific file or directory identifier.
      'git://github.com/username/project.git@a/file/or/directory',
      // A local file or directory to copy and install.
      'a/file/or/directory'
    ]
  }
}

// Project settings configuration.
exports.settings = {
  // Override the default plugins, and/or include custom plugins.
  plugins: {
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
```

## Concepts

**Project Root**: The directory from which all paths resolve to. Determined by location of the *buddy.js* configuration file.

**Sources**: An array of directories from which all referenced files are retrieved from. ***Note:*** A *js* module's id is derived from it's relative path to it's source directory.

**Targets**: Objects that specify the *input* and *output* files or directories for each build. Targets are built in sequence, allowing builds to be chained together. ***Note:*** A *js* target can also have nested child targets, ensuring that dependencies are not duplicated across related builds.

**Target parameters**:

- *input*: file or directory to build. If js (or equivalent) file, all dependencies referenced will be concatenated together for output.
If directory, all compileable files will be compiled, wrapped in module definitions (js), and output to individual js/css files.

- *output*: file or directory to output to.

- *targets*: a nested target that prevents the duplication of source code with it's parent target.

- *modular*: a flag to prevent js files from being wrapped with a module definition.

**Modules**: Each js file is wrapped in a module declaration based on the file's location. Dependencies (and concatenation order) are determined by the use of ```require()``` statements:

```javascript
var lib = require('./my/lib'); // in current package
var SomeClass = require('../someclass'); // in parent package
var util = require('utils/util'); // from root package

lib.doSomething();
var something = new SomeClass();
util.log('hey');
```

Specifying a module's public behaviour is achieved by decorating an *exports* object:

```javascript
var myModuleVar = 'my module';

exports.myModuleMethod = function() {
  return myModuleVar;
};
```

or overwriting the *exports* object completely:

```javascript
function MyModule() {
  this.myVar = 'my instance var';
};

MyModule.prototype.myMethod = function() {
  return this.myVar;
};

module.exports = MyModule;
```

Each module is provided with a ```module```, ```exports```, and ```require``` reference.

When ```require()```-ing a module, keep in mind that the module id is resolved based on the following rules:

 * packages begin at the root folder specified in *buddy.js > js > sources*:
```
'Users/alex/project/src/package/main.js' > 'package/main'
```
 * uppercase filenames are converted to lowercase module ids:
```
'my/package/Class.js' > 'my/package/class'
```

See [node.js modules](http://nodejs.org/docs/v0.8.0/api/modules.html) for more info on modules.

***NOTE***: ```require``` boilerplate needs to be included on the page to enable module loading. It's recommended to ```install``` a library like *git://github.com/popeindustries/browser-require.git*.

## Examples

Copy project boilerplate from a local directory:

```js
exports.dependencies = {
  '.': {
    sources: ['../../boilerplate/project']
  }
}
```

Grab js dependencies to be installed and packaged for inclusion in html:

```js
exports.dependencies = {
  // install location
  'libs/vendor': {
    sources: [
      // library for require boilerplate
      'git://github.com/popeindustries/browser-require.git',
      // jquery at specific version
      'jquery#1.8.2'
    ],
    // packaged and compressed
    output: 'www/assets/js/libs.js'
  }
}
```

Grab sources to be referenced in your builds:

```js
exports.dependencies = {
  // install location
  'libs/src/css': {
    sources: [
      // reference the lib/nib directory for installation
      'git://github.com/visionmedia/nib.git@lib/nib'
    ]
  }
}
```

Compile a library, then reference some library files in your project:

```js
exports.build = {
  js: {
    sources: ['libs/src/coffee', 'libs/js', 'src'],
    targets: [
      {
        // a folder of coffee files (including nested folders)
        input: 'libs/src/coffee',
        // a folder of compiled js files
        output: 'libs/js'
      },
      {
        // the application entry point referencing library dependencies
        input: 'src/main.js',
        // a concatenation of referenced dependencies
        output: 'js/main.js'
      }
    ]
  }
}
```

Compile a site with an additional widget using shared sources:

```js
exports.build = {
  js: {
    sources: ['src/coffee'],
    targets: [
      {
        // the application entry point
        input: 'src/coffee/main.coffee',
        // output to main.js (includes all referenced dependencies)
        output: 'js',
        targets: [
          {
            // references some of the same sources as main.coffee
            input: 'src/coffee/widget.coffee',
            // includes only referenced dependencies not in main.js
            output: 'js'
          }
        ]
      }
    ]
  }
}
```

## Changelog

**0.5.2** - Novemver 20, 2012
* added *watch* command

**0.5.1** - Novemver 14, 2012
* added *clean* command to remove all generated files
* added hidden *.buddy-filelog* file for tracking files changes between sessions
* fix for false-negative module wrapping test

**0.5.0** - November 13, 2012
* *compile* command renamed to *build* **[breaking change]**
* changed module naming for compatibility with recent versions of Node.js (camel case no longer converted to underscores) **[breaking change]**
* changed configuration file type to 'js' from 'json'; added *dependencies* and *settings* **[breaking change]**
* changed configuration *target* parameters to *input/output* from *in/out* **[breaking change]**
* changed configuration *target* parameter to *modular* from *nodejs* **[breaking change]**
* concatenated js modules no longer self-booting; need to ```require('main');``` manually **[breaking change]**
* *require* boilerplate no longer included in generated source; install *git://github.com/popeindustries/browser-require.git* or equivalent **[breaking change]**
* removed *watch* command (temporarily) **[breaking change]**
* added *install* command and project dependency management
* added plugin support for compilers, compressors, linters, and modules; added support for custom plugins
* added code linting
* all errors now throw
* complete code base refactor

## License

Copyright (c) 2011 Pope-Industries &lt;alex@pope-industries.com&gt;

Permission is hereby granted to do whatever you want with this software, but I won't be held responsible if something bad happens.