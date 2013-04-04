# Changelog

**0.11.1** - April 4, 2013
* fix for watch builds not correctly parsing dependency content

**0.11.0** - April 4, 2013
* `install` command now optional add-on with separate `buddy-dependencies` install via npm

**0.10.1** - April 4, 2013
* `install` command enabled

**0.10.0** - April 3, 2013
* `install` command temporarily disabled until downstream fixes for Node 0.10 arrive
* total makeover to simplify and optimize the codebase
* no longer parse source directories; resolve dependency references and paths automatically
* removed ability to specify custom plugins in favour of improved startup time

**0.9.3** - March 11, 2013
* fixed bug that prevented file changes from refreshing the browser during live-reload `watch`

**0.9.2** - March 5, 2013
* fixed bug that prevented file dependencies from being reset between builds during `watch`

**0.9.1** - March 5, 2013
* added support for using [buddy-cli](https://github.com/popeindustries/buddy-cli)

**0.9.0** - February 28, 2013
* added basic webserver with `-s --serve` flag
* added support for LiveScript js files
* added support for precompiling Handlebars templates to .js

**0.8.0** - February 27, 2013
* moved dependency installer, terminal printing, file watching, and fs utils into separate projects
* added basic jade html template support
* css dependencies are now able to be imported multiple times in the same build target

**0.7.3** - February 18, 2013
* added ignore syntax for build sources: `["a/source/directory", "!a/source/directory/ignored"]`
* added build target property to specify the name and location of compressed output: `output_compressed`
* fixed an error related to index.js module renaming so that it only affects files in the root of source folders. Avoids multiple `index` modules

**0.7.2** - February 17, 2013
* build target input files that are not in an existing source location, but in the project path, are added automatically
* `package/index.js` files are now given a module name of `package` instead of `package/index`

**0.7.1** - February 16, 2013
* added support for definining configuration in package.json under a `buddy` entry
* fixed dependency install error for zipballs that don't match their unzipped folder names
* upgraded dependencies

**0.7.0** - January 7, 2013
* bye bye CoffeeScript - migrated to js only source
* upgraded dependencies

**0.6.11** - December 21, 2012
* fix css comment removal deleting base64 content

**0.6.10** - December 21, 2012
* updated _Uglify-js_ compressor to 2.0

**0.6.9** - December 14, 2012
* fixed _watch_ not adding new file during renames

**0.6.8** - December 13, 2012
* fixed _install_ crash
* _install_ now overwrites previously downloaded resources
* properly handle duplicate `@import` rules while inlining

**0.6.7** - December 11, 2012
* added _--lazy_ option for generating js modules for lazy evaluation; module contents are encoded as strings to be passed to a Function constructor on first require()

**0.6.6** - December 6, 2012
* added live-reload support for _watch_ command with _--reload_
* re-enabled linting support

**0.6.5** - December 5, 2012
* fix for *watch* command firing repeated change events
* fix for *watch* command not properly building targets on change
* fix for child target building shared resources

**0.6.4** - December 4, 2012
* fix for _--test_ not displaying both stdout and stderr
* added wrapping of batch files in module definitions if _options.modular_ is not false
* fix for building targets that contain no source

**0.6.3** - December 4, 2012
* fix for _watch_ command attempting to watch a source that doesn't exist
* added support for default json config file type

**0.6.2** - December 4, 2012
* fix for css _@import_ inlining

**0.6.1** - December 3, 2012
* added _--test_ to watch command

**0.6.0** - December 3, 2012
* complete rewrite for async file operations
* added _--test_ flag for executing a command after build
* added _--verbose_ flag for outputting detailed notifications during build
* added _ls_ command to list all generated files
* added inlining of '@import' rules for all css source types
* simplified dependency resource parsing on install; only parse 'main' field in component.json/package.json

**0.5.4** - November 23, 2012
* regression fix for _clean_ command
* improved _.buddy-filelog_ force clean
* improved notifications for _install_ and *clean* commands

**0.5.3** - November 23, 2012
* refactored _install_ command behaviour; no longer uses git operations, changed syntax for specifying version ('@') and resources ('#'), added ability to list several resources __[breaking change]__
* _.buddy-filelog_ now stores relative paths for compatibility on different systems
* file deletions limited to resources under the project root

**0.5.2** - Novemver 20, 2012
* added _watch_ command; handle add, remove, and change of source files

**0.5.1** - Novemver 14, 2012
* added _clean_ command to remove all generated files
* added hidden _.buddy-filelog_ file for tracking files changes between sessions
* fix for false-negative module wrapping test

**0.5.0** - November 13, 2012
* _compile_ command renamed to *build* __[breaking change]__
* changed module naming for compatibility with recent versions of Node.js (camel case no longer converted to underscores) __[breaking change]__
* changed configuration file type to 'js' from 'json'; added _dependencies_ and _settings_ __[breaking change]__
* changed configuration _target_ parameters to _input/output_ from _in/out_ __[breaking change]__
* changed configuration _target_ parameter to _modular_ from _nodejs_ __[breaking change]__
* concatenated js modules no longer self-booting; need to ```require('main');``` manually __[breaking change]__
* _require_ boilerplate no longer included in generated source; install _popeindustries/browser-require_ or equivalent __[breaking change]__
* removed _watch_ command (temporarily) __[breaking change]__
* added _install_ command and project dependency management
* added plugin support for compilers, compressors, linters, and modules; added support for custom plugins
* added code linting
* all errors now throw
* complete code base refactor
