[![NPM Version](https://img.shields.io/npm/v/buddy.svg?style=flat)](https://npmjs.org/package/buddy)
[![Build Status](https://img.shields.io/travis/popeindustries/buddy.svg?style=flat)](https://travis-ci.org/popeindustries/buddy)

# buddy

<h4 align="center"><em>Helping you get sh*t done since 2010</em></h4>

**buddy** is a fast and simple build tool for web projects. It can compile source code from higher order js/css/html languages, resolves dependencies, and bundle (and optionally compress) all souces for more efficient delivery to the browser.

### Features

- Resolves and concatenates js/css/html dependencies into file bundles
- Compiles other languages to js/css/html
- Installs Babel and PostCSS plugins automatically
- Watches source files for changes 
- Serves static content (or custom server)
- Refreshes connected browsers
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

Please refer to the annotated [configuration](https://github.com/popeindustries/buddy/blob/master/docs/config.md) to see all the different configuration options.

## How do I?

#### Build something without having to write a config file?

#### Manage js dependencies?

#### Manage css dependencies?

#### Manage html dependencies?

#### Break-up js bundles into smaller files?

#### Generate unique filenames?

#### Inline environment variables?

#### Access the results of sibling builds while building?

#### Ignore a build?

#### Serve built files while developing?

#### Avoid writing relative dependency paths?

#### Alias a js dependency?

#### Make a buddy plugin?

#### Configure Babel?

#### Configure PostCSS?

#### Configure a plugin?

#### Build React (jsx) source?

#### Write js with Flow types?

#### Lazily evaluate a js bundle?

#### Specify target language versions?