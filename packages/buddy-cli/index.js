'use strict';

const find = require('./lib/find');
const program = require('commander');
const signalExit = require('signal-exit');

const useCli = ~require.main.filename.indexOf('buddy-cli');
let buddy;

function exit (code) {
  if (buddy) buddy.destroy();
  process.exit(code);
}

function error (err) {
  console.log(err.stack ? err.stack : err);
  // Ding!
  console.log('\x07');
  exit(1);
}

// Register for uncaught errors and clean up
process.once('uncaughtException', error);
process.once('unhandledRejection', error);
signalExit(exit);

find(useCli, (err, buddyFactory, version) => {
  if (err) throw err;

  program
    .version(version)
    .usage('[options] <command> [configpath]')
    .option('-c, --compress', 'compress output for production deployment')
    .option('-g, --grep <pattern>', 'only run build targets matching <pattern>')
    .option('-i, --invert', 'inverts grep matches')
    .option('--input <filepath>', 'input file/directory for simple config-free build')
    .option('--output <filepath>', 'output file/directory for simple config-free build')
    .option('-r, --reload', 'reload all connected live-reload clients on file change during watch')
    .option('-s, --serve', 'create (or launch) a webserver to serve files during watch')
    .option('-S, --script', 'run script on build completion')
    .option('-m, --maps', 'generate js/css source maps')
    .option('--debug', 'print all messages for debugging');

  program
    .command('build [configpath]')
    .description('build js, css, html, and image sources')
    .action((configpath) => {
      buddy = buddyFactory(parseConfig(configpath), getOptions()).build();
    });

  program
    .command('watch [configpath]')
    .description('watch js, css, html, and image source files and build changes')
    .action((configpath) => {
      let options = getOptions();

      options.watch = true;
      buddy = buddyFactory(parseConfig(configpath), options).watch();
    });

  program
    .command('deploy [configpath]')
    .description('build compressed js, css, html, and image sources')
    .action((configpath) => {
      let options = getOptions();

      options.deploy = options.compress = true;
      buddy = buddyFactory(parseConfig(configpath), options).build();
    });

  program.parse(process.argv);

  // Show help if no arguments or no command
  if (!program.args.length
    || !program.args.filter((arg) => 'string' != typeof arg).length) {
      program.help();
  }
});

/**
 * Parse config
 * @param {String} configpath
 * @returns {Object}
 */
function parseConfig (configpath) {
  if (program.input) {
    configpath = {
      input: program.input,
      output: program.output || '.'
    };
  }

  return configpath;
}

/**
 * Retrieve options object
 * @returns {Object}
 */
function getOptions () {
  return {
    compress: ('compress' in program) ? program.compress : false,
    debug: ('debug' in program) ? program.debug : false,
    deploy: false,
    grep: ('grep' in program) ? program.grep : false,
    invert: ('invert' in program) ? program.invert : false,
    maps: ('maps' in program) ? program.maps : false,
    reload: ('reload' in program) ? program.reload : false,
    script: ('script' in program) ? program.script : false,
    serve: ('serve' in program) ? program.serve : false,
    watch: false
  };
}