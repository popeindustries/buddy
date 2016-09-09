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
Usage: buddy [options] <command> [path/to/package.json || path/to/buddy.js || path/to/buddy.json]

Commands:

  build [config]         build js and css sources
  watch [config]         watch js and css source files and build changes
  deploy [config]        build compressed js and css sources

Options:

  -h, --help             output usage information
  -V, --version          output the version number
  -t, --targets [types]  optional comma separated list of target(s) to build [js,css,html]
  -c, --compress         compress output for production deployment
  -r, --reload           reload all connected live-reload clients on file change during watch [ADD-ON buddy-server]
  -s, --serve            create a webserver to serve static files during watch [ADD-ON buddy-server]
  -S, --script           run script on build completion
  -v, --verbose          print all messages for debugging
```

Once installed, run **buddy** as described [here](https://github.com/popeindustries/buddy#readme)