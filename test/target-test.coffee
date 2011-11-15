path = require 'path'
assert = require 'assert'
vows = require 'vows'
builder = require '../lib/builder'
term = require '../lib/terminal'
file = require '../lib/file'
target = require '../lib/target'

term.silent = true

