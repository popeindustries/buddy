[![NPM Version](https://img.shields.io/npm/v/buddy.svg?style=flat)](https://npmjs.org/package/buddy)
[![Build Status](https://img.shields.io/travis/popeindustries/buddy.svg?style=flat)](https://travis-ci.org/popeindustries/buddy)
[![Downloads](https://img.shields.io/npm/dt/buddy.svg?style=flat)](https://npmjs.org/package/buddy)

# buddy

<h4 align="center"><em>Helping you get sh*t done since 2010</em></h4>

**buddy** is a fast and simple build tool for the web. It compiles source code from higher order *JS/CSS/HTML* languages, resolves dependencies, and bundles all sources for more efficient delivery to the browser.

### Features

- Resolves and manages *JS/CSS/HTML* **dependencies**, efficiently packaging resources into bundled files
- **Transforms** other languages to *JS/CSS/HTML*
- Built around **Babel** and **PostCSS**: installs and configures plugins automatically based on target language version
- For development:
    - **Watches** source files for changes 
    - Runs a static file **server** (or a custom application server)
    - **Refreshes** connected browsers
- For production:
    - Outputs **unique** filenames
    - **Compresses** sources, including images

### Installation

Install **buddy** as a `devDependency` in your project directory:

```bash
$ npm install --save-dev buddy
```

> If you want a global **buddy** command, install the [buddy-cli](https://github.com/popeindustries/buddy-cli) with `$ npm install --global buddy-cli`

### Usage

```text
  Usage: buddy [options] <command> [configpath]


  Commands:

    build [configpath]   build js, css, html, and image sources
    watch [configpath]   watch js, css, html, and image source files and build changes
    deploy [configpath]  build compressed js, css, html, and image sources

  Options:

    -h, --help            output usage information
    -V, --version         output the version number
    -c, --compress        compress output for production deployment
    -g, --grep <pattern>  only run build targets matching <pattern>
    -i, --invert          inverts grep matches
    --input               input file/directory for simple config-free build
    --output              output file/directory for simple config-free build
    -r, --reload          reload all connected live-reload clients on file change during watch
    -s, --serve           create (or launch) a webserver to serve files during watch
    -S, --script          run script on build completion
    -m, --maps            generate js/css source maps
    -v, --verbose         print all messages for debugging
```

### Configuration

**buddy** is configurable via `js` or `json` formatted configuration files. By default, **buddy** looks for the nearest `buddy.js`, `buddy.json`, or `package.json` (with a `buddy` entry). Alternatively, you can specify the path to your configuration file while running the `buddy` command.

Note that, whichever way you configure it, **buddy** will treat ***the directory that contains the configuration file as the project root***.

Please refer to the annotated [configuration guide](https://github.com/popeindustries/buddy/blob/master/docs/config.md) to see all the different options.

### Plugins

**buddy**'s ability to transform and manipulate different source files is made possible  by a flexible plugin system. In fact, all of the core language features are implemented as plugins internally, so there should be very few features that cannot be implemented this way.

One of the most common use cases for extending **buddy** is to enable working with higher-order *JS/CSS/HTML* languages. The following plugins can be installed (`$ npm install --save-dev {plugin}`) if you prefer not to write vanilla *JS/CSS/HTML*:

- **[buddy-plugin-coffeescript](https://www.npmjs.com/package/buddy-plugin-coffeescript)**: transform `.coffee` source files to `.js`
- **[buddy-plugin-typescript](https://www.npmjs.com/package/buddy-plugin-typescript)**: transform `.ts` and `.tsx` source files to `.js`
- **[buddy-plugin-dust](https://www.npmjs.com/package/buddy-plugin-dust)**: transform `.dust` html template source files to `.html`
- **[buddy-plugin-handlebars](https://www.npmjs.com/package/buddy-plugin-handlebars)**: transform `.handlebars` html template source files to `.html`
- **[buddy-plugin-nunjucks](https://www.npmjs.com/package/buddy-plugin-nunjucks)**: transform `.nunjucks` html template source files to `.html`
- **[buddy-plugin-less](https://www.npmjs.com/package/buddy-plugin-less)**: transform `.less` source files to `.css`
- **[buddy-plugin-stylus](https://www.npmjs.com/package/buddy-plugin-stylus)**: transform `.styl` source files to `.css`

Follow the [plugins guide](https://github.com/popeindustries/buddy/blob/master/docs/plugins.md) to learn about writing your own.

## How do I...

- [Manage *JS* dependencies?](#manage-js-dependencies)
- [Manage *CSS* dependencies?](#manage-css-dependencies)
- [Manage *HTML* dependencies?](#manage-html-dependencies)
- [Specify target *JS* versions?](#specify-target-js-versions)
- [Specify target *CSS* versions?](#specify-target-css-versions)
- [Break-up *JS* bundles into smaller files?](#break-up-js-bundles-into-smaller-files)
- [Use source maps?](#use-source-maps)
- [Lazily evaluate a JS bundle?](#lazily-evaluate-a-js-bundle)
- [Inline environment variables?](#inline-environment-variables)
- [Avoid writing relative dependency paths?](#avoid-writing-relative-dependency-paths)
- [Alias a dependency?](#alias-a-dependency)
- [Build React (.jsx) source?](#build-react-jsx-source)
- [Write JS with Flow types?](#write-js-with-flow-types)
- [Configure Babel?](#configure-babel)
- [Configure PostCSS?](#configure-postcss)
- [Configure a plugin?](#configure-a-plugin)
- [Generate unique filenames?](#generate-unique-filenames)
- [Skip a build?](#skip-a-build)
- [Serve files while developing?](#serve-files-while-developing)
- [Reload files while developing?](#reload-files-while-developing)
- [Display output file size?](#display-output-file-size)

#### Manage *JS* dependencies?

*JS* dependencies are declared by use of `require()` expressions (or `import` statement for es6 modules), and closely follow the module semantics as used in [Node.js](http://nodejs.org/api/modules.html). This makes it possible to write modules for the browser the same way as you would for Node.js server environments. Although **buddy** preserves similar author-time semantics, run-time behaviour does differ. In Node.js modules, each file is wrapped in a function closure to provide an isolated scope for module-level variable/function/class declarations, ensuring that there are no conflicts between modules. In the browser, however, wrapping each module in a closure can impose significant start-up [cost](https://nolanlawson.com/2016/08/15/the-cost-of-small-modules/) and overhead. As a result, for performance reasons, **buddy** flattens all modules into a shared scope, renames all declarations, and inlines all calls to `require()`:

```json
{
  "buddy": {
    "build": [
      {
        "input": "src/index.js",
        "output": "www"
      }
    ]
  }
}
```
```js
// src/index.js
const foo = require('./foo');

console.log(foo());
```
```js
// src/foo.js
module.exports = function foo () { 
  return 'foo'; 
};
```
Resulting in:
```js
/** BUDDY BUILT **/

// ...boilerplate

(function () {
/*== src/foo.js ==*/
$m['src/foo.js'] = { exports: {} };
$m['src/foo.js'].exports = function foo () { 
  return 'foo'; 
};
/*≠≠ src/foo.js ≠≠*/

/*== src/index.js ==*/
$m['src/index.js'] = { exports: {} };
const _srcindexjs_foo = $m['src/foo.js'].exports;

console.log(_srcindexjs_foo());
/*≠≠ src/index.js ≠≠*/
})()
```

Although these optimizations are possible to apply in most cases, there are two scenarios where **buddy** needs to de-optimize by wrapping module contents and/or preserving calls to `require()`:

- **referencing modules in another bundle**: `require('module-from-another-bundle')` will be preserved as it cannot be safely inlined ([read more](#break-up-js-bundles-into-smaller-files) about working with multiple bundles)
- **circular dependencies**: modules that `require` each other (including several orders removed) will be wrapped in a closure function and lazily evaluated when eventually called with a non-inlined `require()`

#### Manage *CSS* dependencies?

*CSS* dependencies are declared by use of the `@import` statement. **buddy** replaces these statements with the referenced file contents, ***inlining*** a file's dependencies rather than concatenating them:

```json
{
  "buddy": {
    "build": [
      {
        "input": "src/index.css",
        "output": "www"
      }
    ]
  }
}
```
```css
/* src/index.css */
@import 'foo.css';

body {
  color: red;
}

@import './utils/bar.css';
```
```css
/* src/foo.css */
/* Import from module installed in node_modules */
@import 'normalize.css';
```
```css
/* src/utils/bar.css*/
p {
  color: blue;
}
```
Resulting in:
```css
/* 
  normalize.css content here
*/

body {
  color: red;
}

p {
  color: blue;
}
```

Note that, while a *JS* dependency tree can be optimized to avoid duplicates, the cascading nature of *CSS* requires that dependency order be strictly observed, and as a result, **duplicate `@import` statements will result in duplicate file content**.

#### Manage *HTML* dependencies?

Although *HTML* dependencies are numerous and varied, **buddy** only manages a specific subset of dependencies that are flagged for inlining. Specifying an `inline` attribute on certain tags results in the file contents being copied into the *HTML*:

```json
{
  "buddy": {
    "build": [
      {
        "input": "src/index.html",
        "output": "www"
      }
    ]
  }
}
```
```html
<!DOCTYPE html>
<html>
<head>
  <link inline rel="stylesheet" href="src/index.css">
  <script inline src="src/index.js"></script>
</head>
<body>
  <img inline src="src/image.svg">
</body>
</html>
```
Resulting in:
```html
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      color: red;
    }
  </style>
  <script>
    console.log('foo');
  </script>
</head>
<body>
  <svg>
    <circle cx="50" cy="50" r="25"/>
  </svg>
</body>
</html>
```

#### Specify target *JS* versions?

Since **buddy** uses [Babel](https://babeljs.io) to transform *JS* sources, it is easy to target a specific version of JavaScript you want to output to. Specifying one or more output versions simply loads the appropriate Babel plugins required to generate the correct syntax. If one or more of the plugins have not yet been installed, **buddy** will automatically install them to your `dev-dependencies`:

```json
{
  "buddy": {
    "build": [
      {
        "input": "src/browser.js",
        "output": "www",
        "version": "es5"
      },
      {
        "input": "src",
        "output": "dist",
        "bundle": false,
        "version": "node6"
      }
    ]
  }
}
```

The following *JS* version targets are valid:
- **es5**
- **es2015** (alias **es6**)
- **es2016** (alias **es7**)
- **node4**
- **node6**

In addition to generic language/environment versions, **buddy** also supports browser version targets, and [Autoprefixer](https://github.com/ai/browserslist#queries)-style browser list configuration:

```json
{
  "buddy": {
    "build": [
      {
        "input": "src/chrome.js",
        "output": "www",
        "version": { 
          "chrome": 50
        }
      },
      {
        "input": "src/browsers.js",
        "output": "www",
        "version": ["last 2 versions", "iOS >= 7"]
      }
    ]
  }
}
```

#### Specify target *CSS* versions?

Since **buddy** uses [PostCSS](http://postcss.org) and [Autoprefixer](https://github.com/postcss/autoprefixer) to transform *CSS* sources, it is easy to target specific browser versions (via vendor prefixes) you want to output to:

```json
{
  "buddy": {
    "build": [
      {
        "input": "src/index.css",
        "output": "www",
        "version": ["last 2 versions", "iOS >= 7"]
      }
    ]
  }
}
```

#### Break-up *JS* bundles into smaller files?

Large *JS* bundles can be broken up into a collection of smaller bundles by nesting builds. Each build can have one or more child builds, and any parent modules that are referenced in child builds will **not** be duplicated:

```json
{
  "buddy": {
    "build": [
      {
        "input": "src/libs.js",
        "output": "www",
        "build": [
          {
            "input": "src/index.js",
            "output": "www"
          },
          {
            "input": "src/extras.js",
            "output": "www"
          }
        ]
      }
    ]
  }
}
```
```js
// src/libs.js
const lodash = require('lodash');
```
```js
// src/index.js
const react = require('react');
// The 'lodash' module will not be included because index.js is a child of libs.js
const lodash = require('lodash');
```
```js
// src/extras.js
// The 'react' module will be included because extras.js is not a child of index.js
const react = require('react');
// The 'lodash' module will not be included because index.js is a child of libs.js
const lodash = require('lodash');
```

The same result may also be achieved with dynamic child builds using `buddyImport()`:

```json
{
  "buddy": {
    "build": [
      {
        "input": "src/libs.js",
        "output": "www/assets"
      }
    ],
    "server": {
      "webroot": "www"
    }
  }
}
```
```js
// src/libs.js
buddyImport('./index.js')
  .then((index) => {
    console.log('index module loaded');
  });
```
...compiles to:
```js
// www/assets/libs.js
buddyImport('/assets/index-b621480767a88ba492db23fdc85df175.js', 'src/index')
  .then((index) => {
    console.log('index module loaded');
  });
```


Child builds will be automatically generated and loaded asynchronously at runtime. **Note that some environments may require a `Promise` polyfill**, and that the id's passed to `buddyImport` must be statically resolvable strings. It may also be necessary to configure the child bundle url by declaring a `webroot` property in `buddy.server` config.

#### Use source maps?

Source maps for *JS* and *CSS* sources are automatically generated when bundling with the `--maps` command flag. Source map files are generated alongside output files with an appended `*.map` extension (ex: `www/foo.js.map`). You may configure a `server.sourceroot` base url to load source map files from, but the source map files must then be manually uploaded/moved.

#### Lazily evaluate a *JS* bundle?

By default, js modules in a bundle are evaluated in reverse dependency order as soon as the file is loaded, with the `input` module evaluated and executed last. Sometimes, however, it is useful to delay evaluation and execution until a later time (so-called lazy evaluation). For example, when loading several bundles in parallel, it may be important to have more control over the order of evaluation:

```json
{
  "buddy": {
    "build": [
      {
        "input": "src/libs.js",
        "output": "www",
        "build": [
          {
            "input": "src/index.js",
            "output": "www",
            "bootstrap": false,
            "build": [
              {
                "input": "src/extras.js",
                "output": "www",
                "bootstrap": false
              }
            ]
          }
        ]
      }
    ]
  }
}
```
```js
// After loading libs.js, index.js, and extras.js in parallel...
// ...guarantee that index.js is evaluated before extras.js
require('src/index');
require('src/extras');

```

#### Inline environment variables?

All references to `process.env.*` variables are automatically inlined in *JS* source files. In addition to all the system variables set before build, the following special variables are set *during* build:

- **`RUNTIME`**: current runtime for browser code (value `browser` or `server`)
- **`BUDDY_{LABEL or INDEX}_INPUT`**: input filepath(s) for target identified with `LABEL` or `INDEX` (value `filepath` or `filepath,filepath,...` if multiple inputs)
- **`BUDDY_{LABEL or INDEX}_INPUT_HASH`**: hash(es) of input file(s) for target identified with `LABEL` or `INDEX` (value `xxxxxx` or `xxxxxx,xxxxxx,...` if multiple inputs)
- **`BUDDY_{LABEL or INDEX}_INPUT_DATE`**: timestamp(s) of input file(s) for target identified with `LABEL` or `INDEX` (value `000000` or `000000,000000,...` if multiple inputs)
- **`BUDDY_{LABEL or INDEX}_OUTPUT`**: output filepath(s) for target identified with `LABEL` or `INDEX` (value `filepath` or `filepath,filepath,...` if multiple outputs)
- **`BUDDY_{LABEL or INDEX}_OUTPUT_HASH`**: hash(es) of output file(s) for target identified with `LABEL` or `INDEX` (value `xxxxxx` or `xxxxxx,xxxxxx,...` if multiple outputs)
- **`BUDDY_{LABEL or INDEX}_OUTPUT_DATE`**: timestamp(s) of output file(s) for target identified with `LABEL` or `INDEX` (value `000000` or `000000,000000,...` if multiple outputs)
- **`BUDDY_{LABEL or INDEX}_OUTPUT_URL`**: url(s) of output file(s) for target identified with `LABEL` or `INDEX` (value `/xxx/xxxx` or `/xxx/xxxx,/xxx/xxxx,...` if multiple outputs)

```json
{
  "buddy": {
    "build": [
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
```
The last target (labelled `sw`) will have access to the unique outputs of the previous targets:
```js
  // src/service-worker.js
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

#### Avoid writing relative dependency paths?

Since **buddy** implements the same dependency resolution semantics as Node.js, it is possible to end up with unwieldy relative paths when referencing files from deeply nested project directories: `require('../../../../some-module')`. And as for Node.js, you have a choice between the following two workarounds:

- nest your project source files in a `node_modules` directory:
```text
project/
  node_modules/ (installed with npm)
  src/
    node_modules/ (manually created)
      app/
      libs/
```
- add your project source directory to the `$NODE_PATH` environment variable:
```bash
$ NODE_PATH=./src buddy watch
```
Allowing you to `require('libs/some-module')` from anywhere in your project directory structure.

#### Alias a dependency?

When writing universal modules for use in both server and browser environments, it is sometimes desirable to specify an alternative entry point for inclusion in the browser. The alternative to the `main` *package.json* parameter is `browser`:

```json
{
  "name": "myModule",
  "version": "1.0.0",
  "main": "lib/server.js",
  "browser": "lib/browser.js"
}
```

**buddy** correctly handles this remapping when resolving *node_modules* dependencies that use the [`browser` package.json field](https://github.com/defunctzombie/package-browser-field-spec). In addition, it is possible to employ more advanced uses to alias files and modules directly in your project:

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

In addition to the standard behaviour of remapping a module to a file path, **buddy** extends this concept to allow renaming a project module's id reference:

```json
{
  "browser": {
    "extra-libs": "./src/extra/libs.js"
  }
}
```
```js
// src/index.js
const bar = require('extra-libs'); // Instead of './src/extra/libs'
```

This can be especially useful when using [child bundles](#break-up-js-bundles-into-smaller-files).

#### Build *React* (.jsx) source?

A React language plugin is provided by default. Just specify `react` as a build target version to compile `.jsx` files:

```json
{
  "buddy": {
    "build": [
      {
        "input": "src/index.js",
        "output": "www",
        "version": ["es5", "react"]
      }
    ]
  }
}
```

#### Write *JS* with Flow types?

A Flow plugin is provided by default. Just specify `flow` as a build target version to strip Flow types from `.js` files:

```json
{
  "buddy": {
    "build": [
      {
        "input": "src/index.js",
        "output": "www",
        "version": ["es5", "flow"]
      }
    ]
  }
}
```

#### Configure Babel?

Babel is configured via the `options.babel` build configuration parameter:

```json
{
  "buddy": {
    "build": [
      {
        "input": "src/index.js",
        "output": "www",
        "options": {
          "babel": {
            "plugins": [["babel-plugin-transform-es2015-classes", { "loose": false }]],
            "presets": ["my-cool-babel-preset"]
          }
        }
      }
    ]
  }
}
```

#### Configure PostCSS?

PostCSS is configured via the `options.postcss` build configuration parameter:

```json
{
  "buddy": {
    "build": [
      {
        "input": "src/index.css",
        "output": "www",
        "options": {
          "postcss": {
            "plugins": ["postcss-color-function"]
          }
        }
      }
    ]
  }
}
```

#### Configure a plugin?

Plugins are configured via the `options.{plugin}` build configuration parameter:

```json
{
  "buddy": {
    "build": [
      {
        "input": "src/index.js",
        "output": "www",
        "options": {
          "uglify": {
            "compressor": {
              "drop_debugger": true
            }
          }
        }
      }
    ]
  }
}
```

#### Generate unique filenames?

Unique filenames can be automatically generated by including one of two types of token in the output filename:

- **%date%**: inserts the current time stamp at the time of build
- **%hash%**: inserts a hash of the file's content

```json
{
  "buddy": {
    "build": [
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
```

Unique filenames are generally recommended as a cache optimisation for production deploys, so it's often a good idea to only specify a unique name when compressing:

```json
{
  "buddy": {
    "build": [
      {
        "input": "somefile.js",
        "output": "www",
        "output_compressed": "www/somefile-%hash%.js"
      }
    ]
  }
}
```

#### Skip a build?

Individual builds can be skipped by using the `--grep` and `--invert` command flags. The `--grep` command flag will isolate builds with `input` or `label` that match the provided pattern, and the `--invert` pattern negates the match:

```json
{
  "buddy": {
    "build": [
      {
        "input": "src/index.js",
        "output": "www",
        "label": "js"
      },
      {
        "input": "src/index.css",
        "output": "www",
        "label": "css"
      },
      {
        "input": "src/images",
        "output": "www/images",
        "label": "images"
      }
    ]
  }
}
```
```bash
# Build everything except 'images'
$ buddy build --invert --grep images
```

#### Serve files while developing?

When executing the `watch` command with the `--serve` flag, **buddy** will rely on the [buddy-server](https://www.npmjs.com/package/buddy-server) plugin to launch a local development server. If the plugin is not already installed, **buddy** will automatically install it to your `dev-dependencies`. 

**buddy-server** has two primary modes:

A default static file server that serves files from a local `directory`:
```json
"buddy": {
  "server": {
    "port": 8000,
    "directory": "www"
  }
}
```
Or a custom application server:
```json
"buddy": {
  "server": {
    "port": 8000,
    "file": "./index.js"
  }
}
```

When working with a custom server, you can pass along application environment variables and flags to the Node.js runtime:
```json
"buddy": {
  "server": {
    "port": 8000,
    "file": "./index.js",
    "env": {
      "DEBUG": "*"
    },
    "flags": ["--inspect"]
  }
}
```

#### Reload files while developing?

When executing the `watch` command with the `--serve` and `--reload` flags, **buddy** will rely on the [buddy-server](https://www.npmjs.com/package/buddy-server) plugin to launch a local development server, reloading any connected clients after re-builds. If the plugin is not already installed, **buddy** will automatically install it to your `dev-dependencies`. 

#### Display output file size?

When running the `deploy` command, the minified and gzipped file sizes will be automatically output to the terminal. If the minified size exceeds 250 kB, a warning will also be output:

```text
 building lib/react-browser.js to lib/react.js
  [processed 169 files in 2.52s]
  built and compressed src/lib/react.js
   compressed size: 332 kB
   gzipped size: 60.5 kB
   warning the output file exceeds the recommended 250 kB size
   Consider splitting into smaller bundles to help improve browser startup execution time
```
