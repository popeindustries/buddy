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
    .usage('[options] <command> [path-to-config]')
    .option('-c, --compress', 'compress output for production deployment')
    .option('-g, --grep <pattern>', 'only run build targets matching <pattern>')
    .option('-i, --invert', 'inverts grep matches')
    .option('-r, --reload', 'reload all connected live-reload clients on file change during watch [ADD-ON buddy-server]')
    .option('-s, --serve', 'create a webserver to serve static files during watch [ADD-ON buddy-server]')
    .option('-S, --script', 'run script on build completion')
    .option('-v, --verbose', 'print all messages for debugging');

  program
    .command('build [config]')
    .description('build js, css, html, and image sources')
    .action((config) => {
      buddy.build(config, getOptions());
    });

  program
    .command('watch [config]')
    .description('watch js, css, html, and image source files and build changes')
    .action((config) => {
      let options = getOptions();

      options.watch = true;
      buddy.watch(config, options);
    });

  program
    .command('deploy [config]')
    .description('build compressed js, css, html, and image sources')
    .action((config) => {
      const options = getOptions();

      options.deploy = true;
      buddy.deploy(config, options);
    });

  program.parse(process.argv);

  // Show help if no arguments or no command
  if (!program.args.length
    || !program.args.filter((arg) => 'string' != typeof arg).length) {
      program.help();
  }
});


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