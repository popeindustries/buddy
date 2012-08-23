[![build status](https://secure.travis-ci.org/popeindustries/buddy.png)](http://travis-ci.org/popeindustries/buddy)
# Buddy

Buddy is primarily a build framework for the compilation of higher order js/css languages (coffeescript/stylus/less). 
Additionally, by using Node.js-style module wrapping and syntax, Buddy helps you write the same style of code for server and client.
This modular approach promotes better js code organization, and allows for automatic concatenation (and optional minification) of code for more efficient delivery to the browser. 

## Installation

Use the *-g* global flag to make the **buddy** command available system-wide:

```bash
$ npm -g install buddy
```

## Usage

```bash
$ cd path/to/my/project
# compile all source files
$ buddy compile
# compile and minify all source files
$ buddy -c compile
# watch for source changes and compile
$ buddy watch
# compile and minify for production
$ buddy deploy
# view usage, examples, and options
$ buddy --help
```

### Configuration

The only requirement for adding Buddy support to a project is the presence of a **buddy.json** file:

```json
{
  "js": {
    "sources": ["a/coffeescript/folder", "a/js/folder"],
    "targets": [
      {
        "in": "a/coffeescript/or/js/file",
        "out": "a/js/file/or/folder",
        "targets": [
          {
            "in": "a/coffeescript/or/js/file",
            "out": "a/js/file/or/folder"
          }
        ]
      },
      {
        "in": "a/coffeescript/folder",
        "out": "a/js/folder",
        "nodejs": true
      }
    ]
  },
  "css": {
    "sources": ["a/stylus/folder", "a/less/folder"],
    "targets": [
      {
        "in": "a/stylus/or/less/file",
        "out": "a/css/file/or/folder"
      },
      {
        "in": "a/stylus/or/less/folder",
        "out": "a/css/folder"
      }
    ]
  }
}
```

## Concepts

**Project Root**: The directory from which all paths resolve to. Determined by location of the *buddy.json* config file.

**Sources**: An array of directories from which all referenced files are retrieved from. 
A js module's package name is constructed starting from it's source directory.

**Targets**: Objects that specify the input and output files or directories for each build. 
Targets are built in sequence, allowing builds to be chained together.
A js target can also have nested child targets, ensuring that dependencies are not duplicated across related builds.

**Target parameters**:

- *in*: file or directory to build. If js/coffee file, all dependencies referenced will be concatenated together for output (mixed js/coffee sources are possible).
If directory, all coffee/stylus/less files will be compiled and output to individual js/css files.

- *out*: file or directory to output to.

- *targets*: a nested target that prevents the duplication of js source code with it's parent target.

- *nodejs*: a flag to prevent coffee files from being wrapped with a module declaration. 

**Modules**: Each coffee/js file is wrapped in a module declaration based on the file's location. 
Dependencies (and concatenation order) are determined by the use of ***require*** statements:

```javascript
var lib = require('./my/lib'); // in current package
var SomeClass = require('../some_class'); // in parent package
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

Each module is provided with a ***module***, ***exports***, and ***require*** reference.

When *require*-ing a module, keep in mind that the module id is resolved based on the following rules:

 - packages begin at the root folder specified in buddy.json > js > sources:
```
'Users/alex/project/src/package/main.js' > 'package/main'
```
 - uppercase filenames are converted to lowercase module ids: 
```
'my/package/Class.js' > 'my/package/class'
```
 - camelcase filenames are converted to lowercase/underscore module ids: 
```
'my/package/ClassCamelCase.js' > 'my/package/class_camel_case'
```

See [node.js modules](http://nodejs.org/docs/v0.6.0/api/modules.html) for more info on modules.

## Examples

Compile a library, then reference some library files in your project:

```json
"js": {
  "sources": ["lib/src/coffee", "lib/js", "src"],
  "targets": [
    {
      "in": "lib/src/coffee",  <--a folder of coffee files (including nested folders)
      "out": "lib/js"          <--a folder of compiled js files
    },
    {
      "in": "src/main.js",  <--the application entry point referencing library dependencies
      "out": "js/main.js"   <--a concatenation of referenced dependencies
    }
  ]
}
```

Compile a site with an additional widget using shared sources:

```json
"js": {
  "sources": ["src/coffee"],
  "targets": [
    {
      "in": "src/coffee/main.coffee",  <--the application entry point
      "out": "js",                     <--includes all referenced sources
      "targets": [
        {
          "in": "src/coffee/widget.coffee",  <--references some of the same sources as main.coffee
          "out": "js"                        <--includes only referenced sources not in main.js
        }
      ]
    }
  ]
}
```

## License 

(The MIT License)

Copyright (c) 2011 Pope-Industries &lt;alex@pope-industries.com&gt;

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
