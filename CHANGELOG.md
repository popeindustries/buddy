# Changelog

***Release notes have moved to GitHub [releases page](https://github.com/popeindustries/buddy/releases)***

**5.1.4** - June 29, 2016
* add console warning for missing/unresolvable module (when `process.env.NODE_ENV == "development"`)

**5.1.3** - June 29, 2016
* no longer inline `process.env.X` if value is `undefined`, and add `process.env` polyfill to ensure backwards compatibility

**5.1.2** - June 26, 2016
* update dependencies

**5.1.0** - June 10, 2016
* update `require` boilerplate to work in service/web worker
* add `BUDDY_*` environment variables

**5.0.4** - Apr 27, 2016
* force browser refresh for targets with multiple file outputs
* update dependencies

**5.0.3** - Apr 27, 2016
* update dependencies

**5.0.2** - Apr 27, 2016
* fix filepaths during batched output

**5.0.1** - Apr 26, 2016
* fix handling of unique file names
* fix `require` call for non-bootstrapped modules
* fix resolution of ids when specifying `sources`
* fix ignoring of child targets

**5.0.0** - Apr 22, 2016
* inline all `require()` statements, significantly speeding up browser startup time
* remove necessity for external `require()` boilerplate and `boilerplate` config parameter
* `bootstrap` bundles by default
* add root module id shortcut to allow for `require('myProject')`
* reduce overall number of dependencies
* update dependencies

**4.1.2 - 4.1.3** - Feb 28, 2016
* update `inline-source` dependency (fixes inlining of svg files with embedded `<image>` tags)

**4.1.1** - Feb 24, 2016
* only include global js helpers for root targets

**4.1.0** - Feb 23, 2016
* force `process.env.RUNTIME` equal to `"browser"`
* js dead code removal with two pass compression routine (one before parsing, one before writing). Requires v2.7.0+ of [buddy-plugin-uglify](https://www.npmjs.org/package/buddy-plugin-uglify)

**4.0.1 - 4.0.5** - Feb 23, 2016
* bug fixes

**4.0.0** - Feb 22, 2016
* __update minimum required Node.js version to 4.0__
* __remove *--lint* and *--lazy* flags__
* implement plugin system for all compilers and compressors (see [plugins](https://github.com/popeindustries/buddy/blob/master/README.md#plugins))
* treat sidecar .json data files as dependencies (enables autorefresh while `--watch --reload`)
* fix handling of boilerplate/bootstrap content during batch builds

**3.1.1** - Nov 30, 2015
* fix printed log messages for build tasks
* update dependencies

**3.1.0** - Oct 23, 2015
* fix handling of compile errors to prevent forced restart during `--watch`
* add support for images (gif, jpg, png, svg), including compression when using `deploy` command or `--compress` option

**3.0.2** - Sept 18, 2015
* fix resolution of node_modules with filename-like names ('lodash.isplainobject', etc), and missing "main" parameter

**3.0.1** - Sept 2, 2015
* correctly handle inlining of images
* update dependencies

**3.0.0** - Aug 26, 2015
* greatly simplify configuration by removing need to define targets by type
* replace`--targets` subcommand with `--grep <pattern>` and `--invert` subcommands and `label` parameter to specify specific targets to run
* correctly handle all configuration formats for the `package.json > browser` field, including disabling with `false`
* prevent duplication by promoting all babel helpers to global scope (via `transfigure-babel@5.8.22-3` and higher)
* no longer exit server on build error during `buddy watch --serve`
* improve inlining of deeply nested json dependencies
* parse watch-only sources to allow for more acurate server restarts
* replace `alias` configuration parameter with `package.json > browser` field configuration
* remove `init`, `ls`, and `clean` commands
* remove `server` configuration parameter
* remove support for html template precompilation

**2.3.0** - Feb 11, 2015
* expose all system environment variables to forked app server during `buddy watch --serve`

**2.2.1** - Feb 6, 2015
* fix for app server livereload

**2.2.0** - Feb 5, 2015
* update dependencies

**2.1.0** - Dec 18, 2014
* allow passing JSON config object to builder commands instead of config file (for non-CLI use)

**2.0.0** - Dec 11, 2014
* compile es6 js files to vanilla es5 (use file extension `.es6`)
* properly handle module aliasing in `package.json > browser`
* default source directory derived from `input` when no sources are specified
* handle all dependencies correctly, including `inline` html assets and `require('*.json')`
* properly handle node_module dependencies with different versions
* properly handle resolution of deeply nested html template includes
* ignore dependency warnings for native Node modules
* launch application server if a path is specified in `server.file` when run with `buddy watch --serve`
* add specify environment vars in `server` config
* target `output` is now optional, reverting to watch functionality when run with `buddy watch`
* target `input` and `output` accept arrays of files/directories
* target `input` accepts glob/expansion pattern
* don't lint/parse prebuilt buddy or browserify bundles
* add optional boolean `server` target property to force flagging a server target for shutdown/restart during `buddy watch --reload --serve` (in most cases this can be derived from `input`)

**1.3.3** - Apr 1, 2014
* fix for precompiling dust templates
* fix for rebuilding html directory targets on watch

**1.3.2** - Apr 1, 2014
* fix for including packaged dust partials (`{>"package/template" /}`)

**1.3.1** - Mar 31, 2014
* update buddy-cli

**1.3.0** - Mar 31, 2014
* add `--targets` flag to specify one or more targets to build (`buddy build --targets js,css`)

**1.2.0** - Mar 31, 2014
* remove pointless LiveReload messages
* add ability to render html templates (handlebars/dust/jade) as .html or .js (precompiled) depending on build task
* add syntax for inlining source in html with "absolute" project paths (`src="/src/js/script.js"` => project/src/js/script.js)

**1.1.1** - Mar 21, 2014
* fix error with conversion of repeated relative `require` calls to absolute

**1.1.0** - Feb 17, 2014
* improved handling of nested node_modules dependencies resolution by always converting relative `require` calls to absolute

**1.0.1** - Jan 10, 2014
* updated *browser-require* dependency to better handle root module resolution

**1.0.0** - Jan 10, 2014
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
