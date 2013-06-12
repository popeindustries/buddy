[![Build Status](https://travis-ci.org/popeindustries/buddy.png)](https://travis-ci.org/popeindustries/buddy)

# buddy(1)

**buddy(1)** is a build tool for js/css/html projects. It helps you manage third-party dependencies (optional add-on), compiles source code from higher order js/css/html languages (CoffeeScript/LiveScript/Handlebars/Dust/Stylus/Less/Jade/Twig), automatically wraps js files in module definitions, statically resolves module dependencies, and concatenates (and optionally compresses) all souces into a single file for more efficient delivery to the browser.

**Current version:** 0.17.2 *[See [Change Log](https://github.com/popeindustries/buddy/blob/master/CHANGELOG.md) for more details]*

## Features

- Allows you to write js __modules__ without the module boilerplate (similar to Node.js)
- Resolves js module __dependencies__ automatically
- Supports efficient ___lazy___ runtime evaluation by storing js modules as strings
- Resolves all relative dependencies on __deploy__
- __Compiles__ _CoffeeScript_, _LiveScript_, _Handlebars_, _Dust_, _Stylus_, _Less_, _Twig_, and _Jade_ source files
- __Concatenates__ js modules into a single file
- Runs js and css code through __linters__ to check for syntax errors
- __Watches__ for source changes and builds automatically
- __Serves__ static files from specified directory on specified port
- __Refreshes__ connected browsers after each change
- __Inlines__ css `@imports` automatically
- __Inlines__ html `<script>` and `<link>` tags when flagged with `inline` attributes
- __Inlines__ json content with `require("path/to/my.json")`
- Supports execution of a ___script___ after each build
- Supports execution of ___hook___ scripts `afterEach` file is processed, and `before` and `after` a target is built
- [Add-on] Copies __packages__ from GitHub to your project
- [Add-on] Copies __assets__ from a local destination to your project

## Installation

To avoid running **buddy(1)** directly as a global command, and thus avoid versioning problems across different projects, it is highly recommended that you instead install the separate [buddy-cli](https://github.com/popeindustries/buddy-cli) command line interface system-wide:

```bash
$ npm -g install buddy-cli
```

...then create a *package.json* file for each project, locally installing **buddy** as a devDependency:

```json
{
  "name": "myproject",
  "description": "This is my web project",
  "version": "0.1.0",
  "devDependencies": {
    "buddy": "0.16.x"
  }
}
```
```bash
$ cd path/to/project
$ npm install
```

## Usage

```text
Usage: buddy [options] <command> [path/to/package.json or path/to/buddy.js or path/to/buddy.json]>

Commands:

  init                   set up a basic buddy project
  install [config]       install dependencies
  build [config]         build js and css sources
  watch [config]         watch js and css source files and build changes
  deploy [config]        build compressed js and css sources
  ls                     list all previously created files and directories
  clean                  remove all previously created files and directories

Options:

  -h, --help      output usage information
  -V, --version   output the version number
  -c, --compress  compress output for production deployment
  -l, --lint      check output for syntax and logic errors
  -r, --reload    reload all connected live-reload clients on file change during watch
  -s, --serve     create a webserver to serve static files during watch
  -t, --script    run script on build completion
  -L, --lazy      convert js modules for lazy evaluation
  -v, --verbose   print all messages for debugging
```

### Examples

*See [buddy-dependencies](https://github.com/popeindustries/buddy-dependencies) for `install` command examples.*

Generate `www/main.js` by concatenating and modularizing all dependencies in `src` or `libs/js` referenced in `src/main.js`:

```json
package.json
{
  "name": "myproject",
  "description": "This is my web project",
  "version": "0.1.0",
  "dependencies": {
    "simple-browser-require": "*"
  },
  "devDependencies": {
    "buddy": "0.16.x"
  },
  "buddy": {
    "build": {
      "js": {
        "sources": ["src", "libs/js"],
        "targets": [
          {
            "input": "src/main.js",
            "output": "www/main.js"
          }
        ]
      }
    }
  }
}
```
```bash
$ buddy build
```

Generate `www/main.js` with references to dependencies installed via npm:

```json
package.json
{
  "name": "myproject",
  "description": "This is my web project",
  "version": "0.1.0",
  "dependencies": {
    "simple-browser-require": "*"
    "underscore": "1.4.4"
  },
  "devDependencies": {
    "buddy": "0.16.x"
  },
  "buddy": {
    "build": {
      "js": {
        "sources": ["src"],
        "targets": [
          {
            "input": "src/main.js",
            "output": "www/main.js"
          }
        ]
      }
    }
  }
}
```
```bash
$ buddy build
```

First compile all CoffeeScript files in `libs/src/coffee`, then generate `www/main.js` by concatenating and modularizing all dependencies referenced in 'src/main.js':

```json
package.json
{
  "name": "myproject",
  "description": "This is my web project",
  "version": "0.1.0",
  "dependencies": {
    "simple-browser-require": "*"
  },
  "devDependencies": {
    "buddy": "0.16.x"
  },
  "buddy": {
    "build": {
      "js": {
        "sources": ["src", "libs/js", "libs/src/coffee"],
        "targets": [
          {
            "input": "libs/src/coffee",
            "output": "libs/js"
          },
          {
            "input": "src/main.js",
            "output": "www/main.js"
          }
        ]
      }
    }
  }
}
```
```bash
$ buddy build
```

Generate `www/main.js` and an additional widget `www/widget.js` using shared sources (avoid duplicating dependencies):

```json
package.json
{
  "name": "myproject",
  "description": "This is my web project",
  "version": "0.1.0",
  "dependencies": {
    "simple-browser-require": "*"
  },
  "devDependencies": {
    "buddy": "0.16.x"
  },
  "buddy": {
    "build": {
      "js": {
        "sources": ["src", "libs/js"],
        "targets": [
          {
            "input": "src/main.js",
            "output": "www/main.js",
            "targets": [
              {
                "input": "src/widget.js",
                "output": "www/widget.js"
              }
            ]
          }
        ]
      }
    }
  }
}
```
```bash
$ buddy build
```

Compile a CoffeeScript project for Node.js, skipping module wrapping and concatenation:

```json
package.json
{
  "name": "myproject",
  "description": "This is my server project",
  "version": "0.1.0",
  "devDependencies": {
    "buddy": "0.16.x"
  },
  "buddy": {
    "build": {
      "js": {
        "sources": ["src/coffee"],
        "targets": [
          {
            "input": "src/coffee",
            "output": "js",
            "modular": false
          }
        ]
      }
    }
  }
}
```
```bash
$ buddy build
```

Alias a custom build of **jquery**:

```json
package.json
{
  "name": "myproject",
  "description": "This is my server project",
  "version": "0.1.0",
  "devDependencies": {
    "buddy": "0.16.x"
  },
  "buddy": {
    "build": {
      "js": {
        "sources": ["src"],
        "targets": [
          {
            "input": "src/main.js",
            "output": "www/main.js",
            "alias": {
              "jquery": "./lib/js/jquery-custom-2.0.js"
            }
          }
        ]
      }
    }
  }
}
```
```javascript
var jquery = require('jquery');
```

Modify the file output with an `afterEach` hook:

```json
package.json
{
  "name": "myproject",
  "description": "This is my server project",
  "version": "0.1.0",
  "devDependencies": {
    "buddy": "0.16.x"
  },
  "buddy": {
    "build": {
      "js": {
        "sources": ["src"],
        "targets": [
          {
            "input": "src/main.js",
            "output": "www/main.js",
            "afterEach": "context.content = require('fs').readFileSync(require('path').resolve('./scripts/header.js'), 'utf8') + context.content; callback(null);"
          }
        ]
      }
    }
  }
}
```
```bash
$ buddy build
```

Start a basic web server and refresh the browser (using the Live-Reload browser plugin) after each build triggered by source file changes:

```json
package.json
{
  "name": "myproject",
  "description": "This is my web project",
  "version": "0.1.0",
  "devDependencies": {
    "buddy": "0.16.x"
  },
  "buddy": {
    "settings": {
      "server": {
        "directory": "www",
        "port": 8080
      }
    }
  }
}
```
```bash
$ buddy watch -rs
```

### Configuration

Complete annotated `buddy.js` configuration file:

```js
// Project build configuration.
exports.build = {
  js: {
    // Directories containing potential js source files for this project ('node_modules' are added by default).
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
        // An alternate destination in which to save the compressed output.
        output_compressed: 'a/js/file/or/directory',
        // A script to run before a target is built.
        before: 'console.log(context); callback(null);'
        // A script to run after a target is built.
        after: './hooks/after.js'
        // A script to run after each output file is written to disk.
        afterEach: 'context.content = "foo"; callback(null);'
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
        // Files are batch processed when a directory is used as input,
        // though @import'ed dependencies are still resolved and inlined.
        input: 'a/stylus/less/or/css/directory',
        output: 'a/css/directory'
      }
    ]
  }
}

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
}

// Project settings configuration.
exports.settings = {
  // Run a command after build
  script: 'command --flags',
  // Configure webserver
  server: {
    // Defaults to project root
    directory: 'a/project/directory',
    // Defaults to 8080
    port: 8000
  }
}
```

## Concepts

### BUILD

**Project Root**: The directory from which all paths resolve to. Determined by location of the configuration file.

**Sources**: An array of directories from which all referenced files are retrieved from. ***Note:*** A *js* module's id is derived from it's relative path to it's source directory.

**Targets**: Objects that specify the *input* and *output* files or directories for each build. Targets are built in sequence, allowing builds to be chained together. ***Note:*** A *js* target can also have nested child targets, ensuring that dependencies are not duplicated across related builds.

**Target parameters**:

- **input**: file or directory to build. If js (or equivalent) file, all dependencies referenced will be concatenated together for output.
If directory, all compileable files will be compiled, wrapped in module definitions (js), and output to individual js/css files.

- **output**: file or directory to output to.

- **targets**: a nested target that prevents the duplication of source code with it's parent target.

- **modular**: a flag to prevent js files from being wrapped with a module definition.

- **output_compressed**: an alternate file or directory to use for compressed output.

- **before**, **after**, **afterEach**: hooks for modifying the build process (see [hooks](https://github.com/popeindustries/buddy/#hooks))

### MODULES

Each js file is wrapped in a module declaration based on the file's location. Dependencies are determined by the use of ```require()``` statements:

```javascript
var lib = require('./my/lib'); // in current package
var SomeClass = require('../SomeClass'); // in parent package
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

 * packages begin at the root folder specified in *build > js > sources*:
```
'Users/alex/project/src/package/main.js' > 'package/main'
```
 * ids are case-sensitive:
 ```
 'package/MyClass.js' > 'package/MyClass'
 ```

See [node.js modules](http://nodejs.org/api/modules.html) for more info on modules.

***NOTE***: ```require``` boilerplate needs to be included in the browser to enable module loading. It's recommended to ```install``` a library like *popeindustries/browser-require* (npm: simple-browser-require).

### HOOKS

It is possible to intervene in the build process through the use of *hooks*. Hooks are assigned to specific targets and defined in the target configuration. There are three types available:

- **before**: executed before a *target* is built

- **after**: executed after a *target* is built

- **afterEach**: executed after an output *file* is processed, but before it is written to disk

Hooks can be written as inline JavaScript, or loaded from a file if a path is specified:

```json
{
  ...
  "targets": [
    {
      "input": "somefile.js",
      "output": "somedir",
      "before": "console.log('before hook'); callback(null);",
      "after": "path/to/afterHook.js"
    }
  ]
  ...
}
```

All hooks are passed the following arguments:

- **context**: the `target` (before and after) or `file` (afterEach) instance

- **options**: the runtime options used to execute buddy (`compress`, `lazy`, `reload`, `watch`, `deploy`, etc)

- **callback**: a callback function that accepts an optional `error`. **MUST** be called in order to return control back to the program.

### ALIASES

Specifying aliases allow you to override the default behaviour for automatically resolving module ids. Aliases are defined in the target configuration:

```json
{
  ...
  "targets": [
    {
      "input": "somefile.js",
      "output": "somedir",
      "alias": {
        "jquery": "./lib/js/jquery-custom-2.0.js",
        "dust": "./node_modules/dustjs-linkedin/dist/dust-core-1.2.3.js"
      }
    }
  ]
  ...
}
```
```javascript
var jquery = require('jquery')
  , dust = require('dust');
```

### DEPENDENCIES

*See [buddy-dependencies](https://github.com/popeindustries/buddy-dependencies).*

## License

(The MIT License)

Copyright (c) 2011-2013 Pope-Industries &lt;alex@pope-industries.com&gt;

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
