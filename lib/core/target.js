var fs = require('fs')
	, path = require('path')
	, async = require('async')
	, term = require('buddy-term')
	, debug = term.debug
	, strong = term.strong
	, colour = term.colour
	, print = term.print
	, warn = term.warn
	, fsutils = require('recur-fs')
	, indir = fsutils.indir
	, readdir = fsutils.readdir
	, mkdir = fsutils.mkdir
	, ignored = fsutils.ignored;

var BUILT_HEADER = '/*BUILT ';
