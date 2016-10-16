[![NPM Version](https://img.shields.io/npm/v/buddy.svg?style=flat)](https://npmjs.org/package/buddy)
[![Build Status](https://img.shields.io/travis/popeindustries/buddy.svg?style=flat)](https://travis-ci.org/popeindustries/buddy)

# buddy

<h4 align="center"><em>Helping you get sh*t done since 2010</em></h4>

**buddy** is a fast and simple build tool for web projects. It can compile source code from higher order *JS/CSS/HTML* languages, resolves dependencies, and bundle (and optionally compress) all souces for more efficient delivery to the browser.

### Features

- Resolves and concatenates *JS/CSS/HTML* dependencies into file bundles
- Compiles other languages to *JS/CSS/HTML*
- Installs Babel and PostCSS plugins automatically based on target language version
- For development:
    - Watches source files for changes 
    - Runs a static file server (or a custom server)
    - Refreshes connected browsers
- For production:
    - Outputs unique filenames
    - Compresses sources, including images

### Installation

Install **buddy** as a `devDependency` in your project directory:

```bash
$ npm install --save-dev buddy
```

> If you want a global **buddy** command, install the [buddy-cli](https://github.com/popeindustries/buddy-cli) with `$ npm install --global buddy-cli`

### Usage

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

### Configuration

**buddy** is configurable via `js` or `json` formatted configuration files. By default, **buddy** looks for the nearest `buddy.js`, `buddy.json`, or `package.json` (with a `buddy` entry). Alternatively, you can specify the path to your configuration file while running the `buddy` command.

Note that, whichever way you configure it, **buddy** will treat *the directory that contains the configuration file as the project root*.

Please refer to the annotated [configuration guide](https://github.com/popeindustries/buddy/blob/master/docs/config.md) to see all the different options.

### Plugins

**buddy**'s ability to transform and manipulate different source files is made possible  by a flexible plugin system. In fact, all of the core language features are implemented as plugins internally, so there should be very few features that cannot be implemented this way.

One of the most common use cases for extending **buddy** is to enable working with higher-order *JS/CSS/HTML* languages. The following plugins can be installed (`$ npm install --save-dev {plugin}`) if you prefer not to write vanilla *JS/CSS/HTML*:

- **[buddy-plugin-coffeescript](https://www.npmjs.com/package/buddy-plugin-coffeescript)**: transform `.coffee` source files to `.js`
- **[buddy-plugin-dust](https://www.npmjs.com/package/buddy-plugin-dust)**: transform `.dust` html template source files to `.html`
- **[buddy-plugin-handlebars](https://www.npmjs.com/package/buddy-plugin-handlebars)**: transform `.handlebars` html template source files to `.html`
- **[buddy-plugin-nunjucks](https://www.npmjs.com/package/buddy-plugin-nunjucks)**: transform `.nunjucks` html template source files to `.html`
- **[buddy-plugin-less](https://www.npmjs.com/package/buddy-plugin-less)**: transform `.less` source files to `.css`
- **[buddy-plugin-stylus](https://www.npmjs.com/package/buddy-plugin-stylus)**: transform `.styl` source files to `.css`

Follow the [plugins guide](https://github.com/popeindustries/buddy/blob/master/docs/plugins.md) to learn about writing your own.

## How do I?

#### Manage *JS* dependencies?

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

Although *HTML* dependencies are numerous and varid, **buddy** only manages a specific subset of dependencies that are flagged for inlining. Specifying an `inline` attribute on certain tags results in the file contents being copied into the *HTML*:

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

#### Generate unique filenames?

Unique filenames can be automatically generated by including one of two types of token in the output filename:

- **%date%**: inserts the current timestamp at the time of build
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

#### Inline environment variables?

All references to `process.env.*` variables are automatically inlined in *JS* source files. In addition to all the system variables set before build, the following special variables are set *during* build:

- **`RUNTIME`**: current runtime for browser code (value `browser` or `server`)
- **`BUDDY_{LABEL or INDEX}_INPUT`**: input filepath(s) for target identified with `LABEL` or `INDEX` (value `filepath` or `filepath,filepath,...` if multiple inputs)
- **`BUDDY_{LABEL or INDEX}_INPUT_HASH`**: hash(es) of input file(s) for target identified with `LABEL` or `INDEX` (value `xxxxxx` or `xxxxxx,xxxxxx,...` if multiple inputs)
- **`BUDDY_{LABEL or INDEX}_INPUT_DATE`**: timestamp(s) of input file(s) for target identified with `LABEL` or `INDEX` (value `000000` or `000000,000000,...` if multiple inputs)
- **`BUDDY_{LABEL or INDEX}_OUTPUT`**: output filepath(s) for target identified with `LABEL` or `INDEX` (value `filepath` or `filepath,filepath,...` if multiple outputs)
- **`BUDDY_{LABEL or INDEX}_OUTPUT_HASH`**: hash(es) of output file(s) for target identified with `LABEL` or `INDEX` (value `xxxxxx` or `xxxxxx,xxxxxx,...` if multiple outputs)
- **`BUDDY_{LABEL or INDEX}_OUTPUT_DATE`**: timestamp(s) of output file(s) for target identified with `LABEL` or `INDEX` (value `000000` or `000000,000000,...` if multiple outputs)

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

#### Avoid writing relative dependency paths?

#### Alias a *JS* dependency?

#### Make a buddy plugin?

Check out the [plugins guide](https://github.com/popeindustries/buddy/blob/master/docs/plugins.md) if you want to get your hands dirty.

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

#### Build React (.jsx) source?

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

#### Write js with Flow types?

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
require('src/index.js');
require('src/extras.js');

```

