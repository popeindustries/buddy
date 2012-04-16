path = require 'path'
fs = require 'fs'
Builder = require '../lib/builder'
term = require '../lib/terminal'
file = require '../lib/file'
target = require '../lib/target'

term.silent = true

loadConfig = (workingDir, configPath) ->
	process.chdir(workingDir)
	builder = new Builder()
	builder._loadConfig(builder._locateConfig(configPath))

describe 'Builder', ->
	describe '[config]', ->
		describe 'loading config JSON file', ->
			describe 'from a valid working directory', ->
				it 'should return true', ->
					loadConfig(path.resolve(__dirname, 'fixtures/config')).should.be.true
			describe 'from an invalid working directory', ->
				it 'should return false', ->
					loadConfig(path.resolve(__dirname, '../../')).should.be.false
			describe 'from a valid nested working directory', ->
				it 'should return true', ->
					loadConfig(path.resolve(__dirname, 'fixtures/config/nested')).should.be.true
			describe 'with an invalid JSON format', ->
				it 'should return false', ->
					loadConfig(path.resolve(__dirname, 'fixtures/config'), 'buddy_bad.json').should.be.false
			describe 'with a valid file path', ->
				it 'should return true', ->
					loadConfig(path.resolve(__dirname, 'fixtures/config'), 'buddy.json').should.be.true
			describe 'with an invalid file path', ->
				it 'should return false', ->
					loadConfig(path.resolve(__dirname, 'fixtures/config'), 'buddy_none.json').should.be.false
			describe 'with a valid directory path', ->
				it 'should return true', ->
					loadConfig(path.resolve(__dirname, 'fixtures/config')).should.be.true
