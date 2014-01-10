# Changelog

**1.0.0** - Jan x, 2014
* updated `buddy-cli` to fix errors with `buddy init`
* added `boilerplate` target option to automatically include the [browser-require](https://github.com/popeindustries/browser-require) source
* added `bootstrap` target option to automatically call `require('module');` at the end of the file
* removed `settings` from configuration, moving `server` and `script` to the top level
* improved `--script` execution handling
* improved handling of nested node_modules dependencies resolution
* `--serve` and `--reload` behaviour during `watch` is now an optional add-on with separate `buddy-server` install via npm
* removed *LiveScript* support
* update dependencies for all packages

**0.17.9** - Dec 18, 2013
* (still another) fix for module id generation on windows with multiple backslashes [@andersaloof](https://github.com/andersaloof)

**0.17.8** - Sept 30, 2013
* fix for module id generation on windows with multiple backslashes

**0.17.7** - Sept 28, 2013
* fix error resolving paths in `use(...)` calls for `.styl` compilation

**0.17.6** - Sept 3, 2013
* swallow all server errors emitted during `watch --reload --serve`

**0.17.5** - Sept 2, 2013
* updated dependencies for all packages

**0.17.4** - July 2, 2013
* fix for backslashes in module id on Win32

**0.17.3** - June 12, 2013
* fixed compiled `.dust` module registration

**0.17.2** - June 12, 2013
* updated compilers to latest
* fixed error handling for `.less` compiling

**0.17.1** - June 12, 2013
* return empty object instead of string when json inlining fails
* warn when json inlining fails

**0.17.0** - June 11, 2013
* add inlining of json content via `require("path/to/my.json")`

**0.16.4** - May 29, 2013
* upgrade buddy-server to allow basic file and directory rerouting during `--serve`

**0.16.3** - May 29, 2013
* fix for empty file on watch change

**0.16.2** - May 26, 2013
* fix for lost aliases on watch changes

**0.16.1** - May 26, 2013
* fix for improperly cleared identity cache returning wrong resource during sequential target builds

**0.16.0** - May 26, 2013
* add support for aliasing module ids (see [readme](https://github.com/popeindustries/buddy/#aliases))

**0.15.1** - May 26, 2013
* make sure that global objects are available in the hook execution context

**0.15.0** - May 26, 2013
* added support for `before`, `after`, and `afterEach` hooks (see [readme](https://github.com/popeindustries/buddy/#hooks))

**0.14.0** - April 24, 2013
* added support for inlining html `<script>` and `<link>` tag sources when an `inline` attribute is used
* `require` ids are now case-sensitive and no longer automatically lower-cased (conforms with Node.js standard)
* improve handling of Node.js module `require`s

**0.13.1** - April 23, 2013
* fix for error when running `--test`

**0.13.0** - April 23, 2013
* added support for compiling Dust.js templates

**0.12.4** - April 22, 2013
* fix for Twig template includes [@superunrelated](https://github.com/superunrelated)
* update dependencies

**0.12.3** - April 19, 2013
* added support for compiling Twig templates [@superunrelated](https://github.com/superunrelated)

**0.12.2** - April 17, 2013
* udpates for version 0.2.0 of [buddy-dependencies](https://github.com/popeindustries/buddy-dependencies)

**0.12.1** - April 15, 2013
* fix dependency resolution for css `@import` calls

**0.12.0** - April 15, 2013
* reduce runtime module lookup time by converting all relative ids used in `require` calls to absolute on execution of `deploy` command
* fix for lazy-loading module escaping when compressing

**0.11.3** - April 12, 2013
* improve handing of 'require'-ing node_modules with dependencies

**0.11.2** - April 4, 2013
* fix for file processing race conditions that prevented proper compilation of source files

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
