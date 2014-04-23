[![Build Status](https://travis-ci.org/popeindustries/buddy.png)](https://travis-ci.org/popeindustries/buddy)

# buddy(1)

**buddy(1)** is a build tool for js/css/html projects. It helps you manage third-party dependencies (optional add-on), compiles source code from higher order js/css/html languages (CoffeeScript/Handlebars/Dust/Stylus/Less/Jade/Twig), automatically wraps js files in module definitions, statically resolves module dependencies, and concatenates (and optionally compresses) all souces into a single file for more efficient delivery to the browser.

**Current version:** 1.3.3 *[See [Change Log](https://github.com/popeindustries/buddy/blob/master/CHANGELOG.md) for more details]*

## Features

- Allows you to write js __modules__ without the module boilerplate (similar to Node.js)
- Resolves js module __dependencies__ automatically
- Supports efficient ___lazy___ runtime evaluation by storing js modules as strings
- Resolves all relative dependencies
- __Compiles__ _CoffeeScript_, _Handlebars_, _Dust_, _Stylus_, _Less_, _Twig_, and _Jade_ source files
- __Concatenates__ js modules into a single file
- Runs js and css code through __linters__ to check for syntax errors
- __Watches__ for source changes and builds automatically
- [Add-on] __Serves__ static files from specified directory on specified port
- [Add-on] __Refreshes__ connected browsers after each change
- __Inlines__ css `@imports` automatically
- __Inlines__ html `<script>` and `<link>` tags when flagged with `inline` attributes
- __Inlines__ json content with `require("path/to/my.json")`
- Supports execution of a ___script___ after each build
- Supports execution of ___hook___ scripts `afterEach` file is processed, and `before` and `after` a target is built

## Installation

To avoid running **buddy(1)** directly as a global command, and thus avoid versioning problems across different projects, it is highly recommended that you instead install the separate [buddy-cli](https://github.com/popeindustries/buddy-cli) command line interface system-wide:

```bash
$ npm -g install buddy-cli
```

...run `buddy init` or manually create a *package.json* file for each project, locally installing **buddy** as a devDependency:

```json
{
  "name": "myproject",
  "description": "This is my web project",
  "version": "0.1.0",
  "devDependencies": {
    "buddy": "1.2.0"
  },
  "buddy": {
    ...
  }
}
```
```bash
$ cd path/to/project
$ npm install
```

## Usage

```text
Usage: buddy [options] <command> [path/to/package.json || path/to/buddy.js || path/to/buddy.json]

Commands:

  init                   set up a basic buddy project
  install [config]       install dependencies [ADD-ON buddy-dependencies]
  build [config]         build js and css sources
  watch [config]         watch js and css source files and build changes
  deploy [config]        build compressed js and css sources
  ls                     list all previously created files and directories
  clean                  remove all previously created files and directories

Options:

  -h, --help             output usage information
  -V, --version          output the version number
  -t, --targets [types]  optional comma separated list of target(s) to build [js,css,html]
  -c, --compress         compress output for production deployment
  -l, --lint             check output for syntax and logic errors
  -r, --reload           reload all connected live-reload clients on file change during watch [ADD-ON buddy-server]
  -s, --serve            create a webserver to serve static files during watch [ADD-ON buddy-server]
  -S, --script           run script on build completion
  -L, --lazy             convert js modules for lazy evaluation
  -v, --verbose          print all messages for debugging
```

## Configuration

Please refer to the annotated [buddy.js](https://github.com/popeindustries/buddy/blob/master/docs/buddy.js) configuration file for all possible configuration settings.

## Build concepts

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

- **boilerplate**: a flag to specify inclusion of [browser-require](https://github.com/popeindustries/browser-require) source code in the output file

- **bootstrap**: a flag to specify that the entry-point module be automatically `require`'d to force application startup

### Hooks

It is possible to intervene in the build process through the use of *hooks*. Hooks are assigned to specific targets and defined in the target configuration. There are three types available:

- **before**: executed before a *target* is built

- **after**: executed after a *target* is built

- **afterEach**: executed after an output *file* is processed, but before it is written to disk

Hooks can be written as inline JavaScript, or loaded from a file if a path is specified:

```json
{
  ...
  "buddy": {
    "js": {
      "targets": [
        {
          "input": "somefile.js",
          "output": "somedir",
          "before": "console.log('before hook'); done(null);",
          "after": "path/to/afterHook.js"
        }
      ]
    }
  }
  ...
}
```

All hooks are passed the following arguments:

- **context**: the `target` (before and after) or `file` (afterEach) instance

- **options**: the runtime options used to execute buddy (`compress`, `lazy`, `reload`, `watch`, `deploy`, etc)

- **done**: a callback function that accepts an optional `error`. **MUST** be called in order to return control back to the program.

### Aliases

Specifying aliases allow you to override the default behaviour for automatically resolving JS module ids. Aliases are defined in the target configuration:

```json
{
  ...
  "buddy": {
    "js": {
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
    }
  }
}
```
```javascript
var jquery = require('jquery')
  , dust = require('dust');
```

## Server

When developing locally, the **buddy-server** add-on and `buddy watch --serve` command will start a simple webserver on `localhost` to test against. Adding the `--reload` flag will take it further by enabling automatic reloading of connected browsers through a [livereload](http://livereload.com) plugin.

Install the add-on alongside **buddy**, and see *[buddy-server](https://github.com/popeindustries/buddy-server)* for more info.

```json
{
  "dependencies": {
    "buddy": "1.2.0",
    "buddy-server": "0.4.3"
  },
  ...
  "buddy": {
    "server": {
      "port": 8000,
      "directory": "www"
    }
    ...
  }
}
```
```bash
$ buddy watch --serve --reload
```

## Working with JS

Each JS file is wrapped in a module declaration based on the file's location. Dependencies are determined by the use of `require()` statements:

```javascript
var lib = require('./my/lib'); // in current package
var SomeClass = require('../SomeClass'); // in parent package
var util = require('utils/util'); // from root package
var module = require('module'); // from node_modules

lib.doSomething();
var something = new SomeClass();
util.log('hey');
```

Specifying a module's public behaviour is achieved by decorating an `exports` object:

```javascript
var myModuleVar = 'my module';

exports.myModuleMethod = function() {
  return myModuleVar;
};
```

...or overwriting the `exports` object completely:

```javascript
function MyModule() {
  this.myVar = 'my instance var';
};

MyModule.prototype.myMethod = function() {
  return this.myVar;
};

module.exports = MyModule;
```

Each module is provided with a `module`, `exports`, and `require` reference.

When `require()`-ing a module, keep in mind that the module id is resolved based on the following rules:

 * packages begin at the root folder specified in *build > js > sources*: `'Users/alex/project/src/package/main.js' > 'package/main'`
 * ids are case-sensitive: `'package/MyClass.js' > 'package/MyClass'`

See [node.js modules](http://nodejs.org/api/modules.html) for more info on modules.

***NOTE***: `require()` boilerplate needs to be included in the browser to enable module loading. It's recommended to `install` a library like [browser-require](https://github.com/popeindustries/browser-require) (npm: simple-browser-require), or set the `boilerplate` flag to have it included automatically.

#### PRECOMPILED TEMPLATES

*dust*, *handlebars*, and *jade* support the precompilation of templates for efficient use in the browser. **buddy** precompiles the template source, wraps the content in a module definition, and exposes a `render()` method:

```html
<!-- src/js/template.dust -->
{title}
<ul>
{#names}
  <li>{name}</li>
{/names}
</ul>
```
```javascript
// src/js/main.js
var template = require('./template')
  , data = {
    title: 'Friends',
    names: [
      {name: 'Joe'},
      {name: 'Bob'},
      {name: 'Annie'}
    ]
  };

template.render(data, function (err, html) {
  // do something with html
});
```

#### "LAZY" MODULES

When run with the `--lazy` flag, **buddy** supports storing js modules as strings which are only evaluated on first `require('module')` call. This can significantly speed up application startup time for large bundles, especially on mobile devices.

### EXAMPLES

Generate `www/main.js` by concatenating and modularizing all dependencies in `src/js` or `libs/js` referenced in `src/js/main.js`, including modules installed via npm (under `node_modules` directory):

```json
{
  "name": "myproject",
  "description": "This is my web project",
  "version": "0.1.0",
  "devDependencies": {
    "buddy": "1.2.0"
  },
  "buddy": {
    "build": {
      "js": {
        "sources": ["src/js", "libs/js"],
        "targets": [
          {
            "input": "src/js/main.js",
            "output": "www/main.js"
          }
        ]
      }
    }
  }
}
```
```javascript
// src/main.js
var lodash = require('lodash') // npm module (node_modules/lodash)
  , view = require('./views/view') // src module (src/views/view.js)
  , util = require('utils/util'); // src module (libs/js/utils/util)
```

Generate `www/main.js` and an additional widget `www/widget.js` using shared sources (avoid duplicating dependencies):

```json
{
  ...
  "buddy": {
    "build": {
      "js": {
        "sources": ["src/js", "libs/js"],
        "targets": [
          {
            "input": "src/js/main.js",
            "output": "www/main.js",
            "targets": [
              {
                "input": "src/js/widget.js",
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

Compile a directory of CoffeeScript files for Node.js, skipping module wrapping and concatenation:

```json
{
  ...
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

Alias a custom build of **jquery**:

```json
{
  ...
  "buddy": {
    "build": {
      "js": {
        "sources": ["src/js"],
        "targets": [
          {
            "input": "src/js/main.js",
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

Generate `www/main.js` by including `require()` boilerplate and automatically bootstraping (`require('main')`) the application:

```json
{
  ...
  "buddy": {
    "build": {
      "js": {
        "sources": ["src/js"],
        "targets": [
          {
            "input": "src/js/main.js",
            "output": "www/main.js",
            "boilerplate": true,
            "bootstrap": true
          }
        ]
      }
    }
  }
}
```

## Working with CSS

Like JS modules, CSS dependencies are automatically resolved through parsing and inlining of `@import` directives.

### Examples

Generate `www/main.css` by concatenating all dependencies in `src/css` referenced in `src/css/main.css`:

```json
{
  ...
  "buddy": {
    "build": {
      "css": {
        "sources": ["src/css"],
        "targets": [
          {
            "input": "src/css/main.css",
            "output": "www/main.css"
          }
        ]
      }
    }
  }
}
```

## Working with HTML

When working with *dust*, *handlebars*, or *jade* templates, dependencies (partials, includes) are automatically resolved and registered before source files are compiled to HTML. In addition, HTML files are parsed for inlineable JS and CSS sources.

### Examples

Resolve template partials:

```html
<!-- layout.handlebars depends on header.handlebars -->
{{> header}}
<body>
  ...
  <!-- ...and footer.handlebars -->
  {{> footer}}
</body>
```

Inline JS and CSS source files with `inline` attribute:

```html
<!-- project/src/html/index.html -->
<!DOCTYPE html>
<html>
<head>
  <!-- inline project/src/js/inlineScript.js -->
  <script inline src="../js/inlineScript.js"></script>
  <!-- inline project/scripts/inlineScript.js -->
  <script inline src="/scripts/inlineScript.js"></script>
  <!-- inline project/src/css/inlineStyle.css -->
  <link inline rel="../css/inlineStyle.css"></link>
</head>
</html>
```

## License

(The MIT License)

Copyright (c) 2011-2014 Pope-Industries &lt;alex@pope-industries.com&gt;

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
