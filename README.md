[![NPM Version](https://img.shields.io/npm/v/buddy.svg?style=flat)](https://npmjs.org/package/buddy)
[![Build Status](https://img.shields.io/travis/popeindustries/buddy.svg?style=flat)](https://travis-ci.org/popeindustries/buddy)

# buddy

**buddy** is a fast and simple build tool for js/css/html projects. It compiles source code from higher order js/css/html languages (*CoffeeScript, es6, JSX, Handlebars, Dust, Nunjucks, Stylus, Less, Jade, Twig*), automatically wraps js files in module definitions, statically resolves js/css/html dependencies, and concatenates (and optionally compresses) all souces into bundles for more efficient delivery to the browser.

## Features

- Allows you to write js __modules__ without module boilerplate (similar to _node.js_)
- Resolves js __dependencies__ automatically (including those installed with `npm`)
- __Compiles__ _CoffeeScript_, _es6_, _JSX_, _Handlebars_, _Dust_, _Nunjucks_, _Stylus_, _Less_, _Twig_, and _Jade_ source files (or others via custom __plugins__)
- __Concatenates__ js modules into file bundles
- __Watches__ for source changes and builds automatically
- [Add-on] __Serves__ static files from specified directory on specified port
- [Add-on] __Restarts__ custom server after each change
- [Add-on] __Refreshes__ connected browsers after each change
- __Inlines__ css `@imports` automatically
- __Inlines__ html `<script>`, `<link>`, and `<img>` tags when flagged with an `inline` attribute
- __Inlines__ json content with `require("path/to/my.json")`
- Supports execution of a custom ___script___ after each build
- Supports extension via execution of ___hook___ scripts `afterEach` file is processed, and `before` and `after` a target is built
- Supports output of __unique__ file names
- Supports compression of __image__ assets
- Inlines environment variables (`process.env.FOO`)

## Installation

To avoid running **buddy** directly as a global command, and thus avoid versioning problems across different projects, it is recommended that you install the separate [buddy-cli](https://github.com/popeindustries/buddy-cli) command line interface system-wide:

```bash
$ npm -g install buddy-cli
```

...create a *package.json* file for each project, locally installing **buddy** as a `devDependency`:

```json
{
  "name": "myproject",
  "description": "This is my web project",
  "version": "1.0.0",
  "devDependencies": {
    "buddy": "5.0.x"
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
Usage: buddy [options] <command> [path-to-config]

  Commands:

    build [config]   build js, css, html, and image sources
    watch [config]   watch js, css, html, and image source files and build changes
    deploy [config]  build compressed js, css, html, and image sources

  Options:

    -h, --help            output usage information
    -V, --version         output the version number
    -c, --compress        compress output for production deployment
    -g, --grep <pattern>  only run build targets matching <pattern>
    -i, --invert          inverts grep matches
    -r, --reload          reload all connected live-reload clients on file change during watch [ADD-ON buddy-server]
    -s, --serve           create a webserver to serve static files during watch [ADD-ON buddy-server]
    -S, --script          run script on build completion
    -v, --verbose         print all messages for debugging
```

## Configuration

Please refer to the annotated [configuration](https://github.com/popeindustries/buddy/blob/master/docs/config.md) file for all possible settings, and **note that the configuration format has changed considerably as of version 3**.

## Plugins

As of version 4, all `transfigure-*` packages have been deprecated in favour of `buddy-plugin-*` package names, now properly referred to as "plugins". In addition, in order to keep install times in check, all compressors have been broken out into separate plugin packages as well.

#### Compiler plugins

The following compiler plugins are currently available:

- **[buddy-plugin-babel](https://www.npmjs.com/package/buddy-plugin-babel)**: transform es6 `.js` and `.jsx` files to es5 `.js` (`npm install buddy-plugin-babel`)
- **[buddy-plugin-coffeescript](https://www.npmjs.com/package/buddy-plugin-coffeescript)**: transform `.coffee` files to `.js` (`npm install buddy-plugin-coffeescript`)
- **[buddy-plugin-dust](https://www.npmjs.com/package/buddy-plugin-dust)**: transform `.dust` html template files to `.html` (`npm install buddy-plugin-dust`)
- **[buddy-plugin-handlebars](https://www.npmjs.com/package/buddy-plugin-handlebars)**: transform `.handlebars` html template files to `.html` (`npm install buddy-plugin-handlebars`)
- **[buddy-plugin-jade](https://www.npmjs.com/package/buddy-plugin-jade)**: transform `.jade` html template files to `.html` (`npm install buddy-plugin-jade`)
- **[buddy-plugin-less](https://www.npmjs.com/package/buddy-plugin-less)**: transform `.less` files to `.css` (`npm install buddy-plugin-less`)
- **[buddy-plugin-nunjucks](https://www.npmjs.com/package/buddy-plugin-nunjucks)**: transform `.nunjucks` html template files to `.html` (`npm install buddy-plugin-nunjucks`)
- **[buddy-plugin-postcss](https://www.npmjs.com/package/buddy-plugin-postcss)**: transform `.css` files to `.css` (`npm install buddy-plugin-postcss`)
- **[buddy-plugin-stylus](https://www.npmjs.com/package/buddy-plugin-stylus)**: transform `.styl` files to `.css` (`npm install buddy-plugin-stylus`)
- **[buddy-plugin-twig](https://www.npmjs.com/package/buddy-plugin-twig)**: transform `.twig` html template files to `.html` (`npm install buddy-plugin-twig`)

#### Compressor plugins

The following compressor plugins are currently available:

- **[buddy-plugin-csso](https://www.npmjs.com/package/buddy-plugin-csso)**: compress `.css` content with [csso](https://www.npmjs.com/package/csso) (`npm install buddy-plugin-csso`)
- **[buddy-plugin-imagemin](https://www.npmjs.com/package/buddy-plugin-imagemin)**: compress `.gif`, `.jpg`, `.png`, `.svg`  content with [imagemin](https://www.npmjs.com/package/imagemin) (`npm install buddy-plugin-imagemin`)
- **[buddy-plugin-uglify](https://www.npmjs.com/package/buddy-plugin-uglify)**: compress `.js` content with [uglifyjs](https://www.npmjs.com/package/uglifyjs) (`npm install buddy-plugin-uglify`)

## Build concepts

**Project Root**: The directory from which all paths resolve to. Determined by location of the configuration file.

**Sources**: An array of additional directories from which referenced files may be retrieved from. The *Project Root* and *node_modules* directories are added by default. ***Note:*** A module's id is derived from it's relative path to it's source directory.

**Targets**: Objects that specify the *input* and *output* files or directories for each build. Targets are built in sequence, allowing builds to be chained together. ***Note:*** A *js* target can also have nested child targets, ensuring that dependencies are not duplicated across related builds.

**Target parameters**:

- **input**: file, directory, glob/expansion pattern, or array of files to build.

- **output**: file, directory, or array of files to output to. *Optional*: when omitted, input files are only watched for changes (during `watch` command).

- **output_compressed**: an alternate file or directory to use for compressed output.

- **targets**: a nested target that prevents the duplication of .js source code with it's parent target.

- **modular**: a flag to prevent .js files from being wrapped with a module definition.

- **before**, **after**, **afterEach**: hooks for modifying the build process

- **bootstrap**: a flag to specify that the entry-point .js module should be lazily evaluated (default value is `true`, triggering evaluation on load. Set to `false` if you want to lazily evaluate by calling `require('myModule')` manually).

- **label**: an arbitrary name to use for matching when using the `--grep` subcommand

### Hooks

It is possible to intervene in the build process through the use of *hooks*. Hooks are assigned to specific targets and defined in the target configuration. There are three types available:

- **before**: executed before a *target* is built

- **after**: executed after a *target* is built

- **afterEach**: executed after an output *file* is processed, but before it is written to disk

Hooks can be written as inline JavaScript, or loaded from a file if a path is specified:

```json
{
  "buddy": {
    "build": {
      "targets": [
        {
          "input": "somefile.js",
          "output": "somedir",
          "before": "console.log('before hook'); done();",
          "after": "path/to/afterHook.js"
        }
      ]
    }
  }
}
```

All hooks are passed the following arguments:

- **context**: the `target` (before and after) or `file` (afterEach) instance

- **options**: the runtime options used to execute buddy (`compress`, `reload`, `watch`, `deploy`, etc)

- **done**: a callback function that accepts an optional `error`. **MUST** be called in order to return control back to the program.

### Aliases

When writing universal modules for use in both server and browser environments, it is sometimes desirable to specify an alternative entrypoint for inclusion in the browser. The alternative to the `main` *package.json* parameter is `browser`:

```json
{
  "name": "myModule",
  "version": "1.0.0",
  "main": "lib/server.js",
  "browser": "lib/browser.js"
}
```

**buddy** correctly handles this remapping when resolving npm dependencies that use the `browser` parameter. In addition, it is possible to employ more advanced uses to alias files and modules directly in your project:

```json
{
  "browser": {
    "someModule": "node_modules/someModule/dist/someModule-with-addons.js"
  }
}
```

...or even disable a module completely when bundling for the browser:

```json
{
  "browser": {
    "someModule": false
  }
}
```

Read more about the uses of `browser` [here](https://gist.github.com/defunctzombie/4339901).

### Unique filenames

Unique filenames can be automatically generated by including one of two types of token in the output filename:

- **%date%**: inserts the current timestamp at the time of build
- **%hash%**: inserts a hash of the file's content

```json
{
  "buddy": {
    "build": {
      "targets": [
        {
          "input": "somefile.js",
          "output": "somefile-%hash%.js"
        },
        {
          "input": "somefile.css",
          "output": "somefile-%date%.css"
        }
      ]
    }
  }
}
```

### Environment variables

All references to `process.env.*` variables are automatically inlined in JS source files. In addition to all the system variables set before build, the following special variables are set *during* build:

- `RUNTIME`: current runtime for browser code (value `browser`)
- `BUDDY_VERSION`: current version number of **buddy** tool
- `BUDDY_{LABEL or INDEX}_INPUT`: input filepath(s) for target identified with `LABEL` or `INDEX` (value `filepath` or `filepath,filepath,...` if multiple inputs)
- `BUDDY_{LABEL or INDEX}_INPUT_HASH`: hash(es) of input file(s) for target identified with `LABEL` or `INDEX` (value `xxxxxx` or `xxxxxx,xxxxxx,...` if multiple inputs)
- `BUDDY_{LABEL or INDEX}_INPUT_DATE`: timestamp(s) of input file(s) for target identified with `LABEL` or `INDEX` (value `000000` or `000000,000000,...` if multiple inputs)
- `BUDDY_{LABEL or INDEX}_OUTPUT`: output filepath(s) for target identified with `LABEL` or `INDEX` (value `filepath` or `filepath,filepath,...` if multiple outputs)
- `BUDDY_{LABEL or INDEX}_OUTPUT_HASH`: hash(es) of output file(s) for target identified with `LABEL` or `INDEX` (value `xxxxxx` or `xxxxxx,xxxxxx,...` if multiple outputs)
- `BUDDY_{LABEL or INDEX}_OUTPUT_DATE`: timestamp(s) of output file(s) for target identified with `LABEL` or `INDEX` (value `000000` or `000000,000000,...` if multiple outputs)

```json
{
  "buddy": {
    "build": {
      "targets": [
        {
          "input": "src/index.js",
          "output": "www/index-%hash%.js",
          "label": "js"
        },
        {
          "input": "src/index.css",
          "output": "www/index-%hash%.css",
          "label": "css"
        },
        {
          "input": "src/service-worker.js",
          "output": "www",
          "label": "sw"
        }
      ]
    }
  }
}
```
The last target (labelled `sw`) will have access to the unique outputs of the previous targets:
```js
  // service-worker.js
  const VERSION = process.env.BUDDY_SW_INPUT_HASH;
  const ASSET_JS = process.env.BUDDY_JS_OUTPUT;
  const ASSET_CSS = process.env.BUDDY_CSS_OUTPUT;
```
...which converts to:
```js
  // service-worker.js
  const VERSION = 'c71a077b25a6ee790a4ce328fc4a0807';
  const ASSET_JS = 'www/index-03d534db2f963c0829b5115cef08fcce.js';
  const ASSET_CSS = 'www/index-cf4e0949af42961334452b1e11fe1cfd.css';
```

## Server

When developing locally, the **[buddy-server](https://www.npmjs.org/package/buddy-server)** add-on and `buddy watch --serve` command will start a simple webserver on `localhost` to test against. Adding the `--reload` flag will enable automatic reloading of connected browsers through a [livereload](http://livereload.com) plugin. Specifying a `file` path will start/restart a custom application server instead of the default development server.

Install the add-on alongside **buddy**, and see **[buddy-server](https://github.com/popeindustries/buddy-server)** for more details.

```json
{
  "dependencies": {
    "buddy": "5.0.0",
    "buddy-server": "1.0.0"
  },
  "buddy": {
    "server": {
      "port": 8000,
      "file": "./index.js",
      "env": {
        "DEBUG": "*"
      }
    }
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

 * packages begin at the root project directory, or those specified in *build > sources*: `'Users/alex/project/src/package/main.js' > 'src/package/main'`
 * ids are case-sensitive: `'package/MyClass.js' > 'package/MyClass'` (depends on platform)

See [node.js modules](http://nodejs.org/api/modules.html) for more info on modules.

### EXAMPLES

Generate `www/main.js` by concatenating and modularizing all dependencies referenced by `src/js/main.js`, including modules installed via npm (from the `node_modules` directory):

```json
{
  "name": "myProject",
  "version": "1.0.0",
  "devDependencies": {
    "buddy": "5.0.0"
  },
  "buddy": {
    "build": {
      "targets": [
        {
          "input": "src/js/main.js",
          "output": "www"
        }
      ]
    }
  }
}
```
```javascript
// src/main.js
var lodash = require('lodash') // npm module (node_modules/lodash)
  , view = require('./views/view') // src module (src/views/view.js);
```

Generate `www/main.js` and an additional widget `www/widget.js` using shared sources (avoiding duplicate dependencies):

```json
{
  "buddy": {
    "build": {
      "targets": [
        {
          "input": "src/js/main.js",
          "output": "www",
          "targets": [
            {
              "input": "src/js/widget.js",
              "output": "www"
            }
          ]
        }
      ]
    }
  }
}
```

Compile a directory of ES6 files for Node.js, skipping module wrapping and concatenation:

```json
{
  "buddy": {
    "build": {
      "targets": [
        {
          "input": "src/es6",
          "output": "js",
          "modular": false
        }
      ]
    }
  }
}
```

Alias a custom build of *jquery*:

```json
{
  "browser": {
    "jquery": "libs/js/jquery-custom.js"
  },
  "buddy": {
    "build": {
      "targets": [
        {
          "input": "src/js/main.js",
          "output": "www"
        }
      ]
    }
  }
}
```
```javascript
var jquery = require('jquery');
```

## Working with CSS

Like .js modules, .css dependencies are automatically resolved through parsing and inlining of `@import` directives. ***NOTE***: unlike .js dependencies, .css dependencies are inlined, and may be inlined more than once if several `@import` directives point to the same file.

### Examples

Generate `www/main.css` by concatenating all dependencies referenced in `src/css/main.css`:

```json
{
  "buddy": {
    "build": {
      "targets": [
        {
          "input": "src/css/main.css",
          "output": "www"
        }
      ]
    }
  }
}
```

## Working with HTML

When working with html or html templating languages (*dust*, *handlebars*, *nunjucks*, *jade*, etc), dependencies (partials, includes) are automatically resolved and registered before source files are compiled. In addition, files are parsed for inlineable js and css sources (those with an `inline` attribute).

### Examples

Resolve template includes when compiling a handlebars template:

```html
<!-- layout.handlebars depends on header.handlebars -->
{{> header}}
<body>
  ...
  <!-- ...and footer.handlebars -->
  {{> footer}}
</body>
```

Inline .js and .css source files with `inline` attribute (see [inline-source](https://github.com/popeindustries/inline-source)):

```html
<!-- project/src/html/index.html -->
<!DOCTYPE html>
<html>
<head>
  <!-- inline project/src/js/inlineScript.js -->
  <script inline src="../js/inlineScript.js"></script>
  <!-- inline project/src/css/inlineStyle.css -->
  <link inline href="../css/inlineStyle.css"></link>
</head>
</html>
```