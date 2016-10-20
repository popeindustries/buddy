[![NPM Version](https://img.shields.io/npm/v/buddy-cli.svg?style=flat)](https://npmjs.org/package/buddy-cli)

# buddy-cli

The **buddy-cli** allows local versions of the **buddy** command to be run directly from the command line without any additional setup. This allows different versions of the **buddy** tool to be run from different projects, without any conflict.

## Installation

```bash
# If necessary, first uninstall your existing buddy global install
$ npm -g uninstall buddy

$ npm -g install buddy-cli
```

## Usage

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
    --debug               print all messages for debugging
```

Once installed, run **buddy** as described [here](https://github.com/popeindustries/buddy#readme)