'use strict';

const find = require('./lib/find');
const program = require('commander');

const useCli = ~require.main.filename.indexOf('buddy-cli');
let buddy;

// Register for uncaught errors and clean up
process.on('uncaughtException', (err) => {
  console.log(err.stack ? err.stack : err);
  // Ding!
  console.log('\x07');
  if (buddy) buddy.exceptionalCleanup();
  process.exit(1);
});

find(useCli, (err, buddyFactory, version) => {
  if (err) throw err;

  buddy = buddyFactory();

  program
    .version(version)
    .usage('[options] <command> [configpath]')
    .option('-c, --compress', 'compress output for production deployment')
    .option('-g, --grep <pattern>', 'only run build targets matching <pattern>')
    .option('-i, --invert', 'inverts grep matches')
    .option('--input', 'input file/directory for simple config-free build')
    .option('--output', 'output file/directory for simple config-free build')
    .option('-r, --reload', 'reload all connected live-reload clients on file change during watch')
    .option('-s, --serve', 'create (or launch) a webserver to serve files during watch')
    .option('-S, --script', 'run script on build completion')
    .option('-v, --verbose', 'print all messages for debugging');

  program
    .command('build [configpath]')
    .description('build js, css, html, and image sources')
    .action((configpath) => {
      buddyFactory(parseConfig(configpath), getOptions()).build();
    });

  program
    .command('watch [configpath]')
    .description('watch js, css, html, and image source files and build changes')
    .action((configpath) => {
      let options = getOptions();

      options.watch = true;
      buddyFactory(parseConfig(configpath), options).watch();
    });

  program
    .command('deploy [configpath]')
    .description('build compressed js, css, html, and image sources')
    .action((configpath) => {
      let options = getOptions();

      options.deploy = options.compress = true;
      buddyFactory(parseConfig(configpath), options).build();
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
    compress: program.compress,
    deploy: false,
    grep: program.grep,
    invert: program.invert,
    reload: program.reload,
    // Backwards compat
    script: program.script || program.test,
    serve: program.serve,
    watch: false,
    verbose: program.verbose
  };
}