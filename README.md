# buddy(1)

**buddy(1)** is a build tool for js/css projects. It helps you manage third-party dependencies, compiles source code from higher order js/css languages (coffeescript/stylus/less), automatically wraps js files in module definitions, statically resolves module dependencies, and concatenates (and optionally compresses) all souces into a single file for more efficient delivery to the browser.

**Current version:** 0.6.9
*[the 0.5.x+ branch is not backwards compatible with earlier versions. See [Change Log](#a1) below for more details]*

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
    "install": "./node_modules/buddy/bin/buddy install",
    "build": "./node_modules/buddy/bin/buddy build",
    "deploy": "./node_modules/buddy/bin/buddy deploy"
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
# build all js modules for 'lazy' evaluation
$ buddy -L build
# build and lint all source files
$ buddy -l build
# build all source files and execute
# the 'test' command defined in config
$ buddy -t build
# build all source files with verbose notifications
$ buddy -v build
# watch and build on source changes
$ buddy watch
# watch and build on source changes,
# reloading open browsers
$ buddy watch -r
# build and compress for production
$ buddy deploy
# list all generated files
$ buddy ls
# remove all generated files
$ buddy clean
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

### BUILD

**Project Root**: The directory from which all paths resolve to. Determined by location of the *buddy.js* configuration file.

**Sources**: An array of directories from which all referenced files are retrieved from. ***Note:*** A *js* module's id is derived from it's relative path to it's source directory.

**Targets**: Objects that specify the *input* and *output* files or directories for each build. Targets are built in sequence, allowing builds to be chained together. ***Note:*** A *js* target can also have nested child targets, ensuring that dependencies are not duplicated across related builds.

**Target parameters**:

- *input*: file or directory to build. If js (or equivalent) file, all dependencies referenced will be concatenated together for output.
If directory, all compileable files will be compiled, wrapped in module definitions (js), and output to individual js/css files.

- *output*: file or directory to output to.

- *targets*: a nested target that prevents the duplication of source code with it's parent target.

- *modular*: a flag to prevent js files from being wrapped with a module definition.

### MODULES

Each js file is wrapped in a module declaration based on the file's location. Dependencies (and concatenation order) are determined by the use of ```require()``` statements:

```javascript
var lib = require('./my/lib'); // in current package
var SomeClass = require('../someclass'); // in parent package
var util = require('utils/util'); // from root package

lib.doSomething();
var something = new SomeClass();
util.log('hey');
```

Specifying a module's public behaviour is achieved by decorating an ```exports``` object:

```javascript
var myModuleVar = 'my module';

exports.myModuleMethod = function() {
  return myModuleVar;
};
```

...or overwriting the ```exports``` object completely:

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

***NOTE***: ```require``` boilerplate needs to be included on the page to enable module loading. It's recommended to ```install``` a library like *popeindustries/browser-require*.

### DEPENDENCIES

Dependency resources are installed from local locations or remotely from Github.

**Sources**: An array of local or remote resource locations.

- **destination**: each group of sources will be installed to the project relative location specified.

- **identifier**: github ```username/repo``` identifiers are preferred, but it is also possible to use identifiers from the [bower](https://github.com/twitter/bower) package manager: ```'jquery', 'backbone', 'underscore'```

- **versioning**: github sources can specify a version by appending ```@``` and a npm-style symantic version: ```'*', '1.2.3', '1.x', '~1.2.0', '>=1.2.3'```

- **resources**: specific resources can be specified by appending ```#``` and a list of ```|``` separated relative file or directory locations: ```'username/repo#a/file/or/directory|another/file/or/directory'```

**Output**: A file destination to concatenate and compress the source contents. The order of *sources* determines the content order.

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
      'popeindustries/browser-require',
      // jquery at specific version
      'jquery@1.8.2'
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
      'visionmedia/nib#lib/nib'
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

<a name="a1"/>
## Changelog

**0.6.9** - December 14, 2012
* fixed _watch_ not adding new file during renames

**0.6.8** - December 13, 2012
* fixed _install_ crash
* _install_ now overwrites previously downloaded resources
* properly handle duplicate _@import_ rules while inlining

**0.6.7** - December 11, 2012
* added _--lazy_ option for generating js modules for lazy evaluation; module contents are encoded as strings to be passed to a Function constructor on first require()

**0.6.6** - December 6, 2012
* added live-reload support for _watch_ command with _--reload_
* re-enabled linting support

**0.6.5** - December 5, 2012
* fix for *watch* command firing repeated change events
* fix for *watch* command not properly building targets on change
* fix for child target building shared resources

**0.6.4** - December 4, 2012
* fix for _--test_ not displaying both stdout and stderr
* added wrapping of batch files in module definitions if _options.modular_ is not false
* fix for building targets that contain no source

**0.6.3** - December 4, 2012
* fix for _watch_ command attempting to watch a source that doesn't exist
* added support for default json config file type

**0.6.2** - December 4, 2012
* fix for css _@import_ inlining

**0.6.1** - December 3, 2012
* added _--test_ to watch command

**0.6.0** - December 3, 2012
* complete rewrite for async file operations
* added _--test_ flag for executing a command after build
* added _--verbose_ flag for outputting detailed notifications during build
* added _ls_ command to list all generated files
* added inlining of '@import' rules for all css source types
* simplified dependency resource parsing on install; only parse 'main' field in component.json/package.json

**0.5.4** - November 23, 2012
* regression fix for _clean_ command
* improved _.buddy-filelog_ force clean
* improved notifications for _install_ and *clean* commands

**0.5.3** - November 23, 2012
* refactored _install_ command behaviour; no longer uses git operations, changed syntax for specifying version ('@') and resources ('#'), added ability to list several resources __[breaking change]__
* _.buddy-filelog_ now stores relative paths for compatibility on different systems
* file deletions limited to resources under the project root

**0.5.2** - Novemver 20, 2012
* added _watch_ command; handle add, remove, and change of source files

**0.5.1** - Novemver 14, 2012
* added _clean_ command to remove all generated files
* added hidden _.buddy-filelog_ file for tracking files changes between sessions
* fix for false-negative module wrapping test

**0.5.0** - November 13, 2012
* _compile_ command renamed to *build* __[breaking change]__
* changed module naming for compatibility with recent versions of Node.js (camel case no longer converted to underscores) __[breaking change]__
* changed configuration file type to 'js' from 'json'; added _dependencies_ and _settings_ __[breaking change]__
* changed configuration _target_ parameters to _input/output_ from _in/out_ __[breaking change]__
* changed configuration _target_ parameter to _modular_ from _nodejs_ __[breaking change]__
* concatenated js modules no longer self-booting; need to ```require('main');``` manually __[breaking change]__
* _require_ boilerplate no longer included in generated source; install _popeindustries/browser-require_ or equivalent __breaking change]__
* removed _watch_ command (temporarily) __[breaking change]__
* added _install_ command and project dependency management
* added plugin support for compilers, compressors, linters, and modules; added support for custom plugins
* added code linting
* all errors now throw
* complete code base refactor

## License

(The MIT License)

Copyright (c) 2011 Pope-Industries &lt;alex@pope-industries.com&gt;

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.