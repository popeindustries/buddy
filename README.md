# Builder

Builder is primarily a tooling framework for the compilation of higher order js/css languages (coffeescript/stylus/less). Additionally, by mimicking the Node.js module workflow, it promotes better code organization, and enables the automatic concatenation of js code for more efficient delivery to the browser.

## Installation

```bash
$ npm -g install git@github.com:popeindustries/builder.git
```

## Usage

```bash
$ cd path/to/my/project
$ build compile
$ build watch
$ build deploy
$ build --help
```

### Setup

The only requirement for adding Builder support to a project is the presence of a 'build.json' file:

```
{
	"version": "0.3.0",
	"js": {
		"sources": ["a/coffeescript/folder", "a/js/folder"],
		"targets": [
			{
				"in": "a/coffeescript/or/js/file",
				"out": "a/js/file/or/folder"
			},
			{
				"in": "a/coffeescript/folder",
				"out": "a/folder"
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
				"out": "a/folder"
			}
		]
	}
}
```

For each build type (js/css), you begin by specifying source paths from which your build targets are referenced.
Each build target should specify an input and corresponding output file or folder. Targets are run in sequence enabling you to chain builds together.
As an example, you could compile a library, then reference some library files in your project:

```
"js": {
	"sources": ["lib/src/coffee", "lib/js", "src"],
	"targets": [
		{
			"in": "lib/src/coffee",  <--a folder of coffee-script files (including nested folders)
			"out": "lib/js"          <--a folder of compiled js files
		},
		{
			"in": "src/main.js",  <--the application entry point referencing library dependencies
			"out": "js/main.js"   <--a concatenation of referenced dependencies
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
