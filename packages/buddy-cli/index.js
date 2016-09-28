var $m = {};
var originalRequire = require;
require = function buddyRequire (id) {
  if (!$m[id]) return originalRequire(id);
  if ('function' == typeof $m[id]) $m[id]();
  return $m[id].exports;
};
/*== node_modules/graceful-readlink/index.js ==*/
$m['graceful-readlink/index.js#1.0.1'] = { exports: {} };
var _gracefulreadlinkindexjs101_fs = require('fs'),
    _gracefulreadlinkindexjs101_lstat = _gracefulreadlinkindexjs101_fs.lstatSync;

$m['graceful-readlink/index.js#1.0.1'].exports.readlinkSync = function (p) {
  if (_gracefulreadlinkindexjs101_lstat(p).isSymbolicLink()) {
    return _gracefulreadlinkindexjs101_fs.readlinkSync(p);
  } else {
    return p;
  }
};
/*≠≠ node_modules/graceful-readlink/index.js ≠≠*/

/*== node_modules/commander/index.js ==*/
$m['commander/index.js#2.9.0'] = { exports: {} };
/**
 * Module dependencies.
 */

var _commanderindexjs290_EventEmitter = require('events').EventEmitter;
var _commanderindexjs290_spawn = require('child_process').spawn;
var _commanderindexjs290_readlink = $m['graceful-readlink/index.js#1.0.1'].exports.readlinkSync;
var _commanderindexjs290_path = require('path');
var _commanderindexjs290_dirname = _commanderindexjs290_path.dirname;
var _commanderindexjs290_basename = _commanderindexjs290_path.basename;
var _commanderindexjs290_fs = require('fs');

/**
 * Expose the root command.
 */

$m['commander/index.js#2.9.0'].exports = $m['commander/index.js#2.9.0'].exports = new _commanderindexjs290_Command();

/**
 * Expose `Command`.
 */

$m['commander/index.js#2.9.0'].exports.Command = _commanderindexjs290_Command;

/**
 * Expose `Option`.
 */

$m['commander/index.js#2.9.0'].exports.Option = _commanderindexjs290_Option;

/**
 * Initialize a new `Option` with the given `flags` and `description`.
 *
 * @param {String} flags
 * @param {String} description
 * @api public
 */

function _commanderindexjs290_Option(flags, description) {
  this.flags = flags;
  this.required = ~flags.indexOf('<');
  this.optional = ~flags.indexOf('[');
  this.bool = !~flags.indexOf('-no-');
  flags = flags.split(/[ ,|]+/);
  if (flags.length > 1 && !/^[[<]/.test(flags[1])) this.short = flags.shift();
  this.long = flags.shift();
  this.description = description || '';
}

/**
 * Return option name.
 *
 * @return {String}
 * @api private
 */

_commanderindexjs290_Option.prototype.name = function () {
  return this.long.replace('--', '').replace('no-', '');
};

/**
 * Check if `arg` matches the short or long flag.
 *
 * @param {String} arg
 * @return {Boolean}
 * @api private
 */

_commanderindexjs290_Option.prototype.is = function (arg) {
  return arg == this.short || arg == this.long;
};

/**
 * Initialize a new `Command`.
 *
 * @param {String} name
 * @api public
 */

function _commanderindexjs290_Command(name) {
  this.commands = [];
  this.options = [];
  this._execs = {};
  this._allowUnknownOption = false;
  this._args = [];
  this._name = name || '';
}

/**
 * Inherit from `EventEmitter.prototype`.
 */

_commanderindexjs290_Command.prototype.__proto__ = _commanderindexjs290_EventEmitter.prototype;

/**
 * Add command `name`.
 *
 * The `.action()` callback is invoked when the
 * command `name` is specified via __ARGV__,
 * and the remaining arguments are applied to the
 * function for access.
 *
 * When the `name` is "*" an un-matched command
 * will be passed as the first arg, followed by
 * the rest of __ARGV__ remaining.
 *
 * Examples:
 *
 *      program
 *        .version('0.0.1')
 *        .option('-C, --chdir <path>', 'change the working directory')
 *        .option('-c, --config <path>', 'set config path. defaults to ./deploy.conf')
 *        .option('-T, --no-tests', 'ignore test hook')
 *
 *      program
 *        .command('setup')
 *        .description('run remote setup commands')
 *        .action(function() {
 *          console.log('setup');
 *        });
 *
 *      program
 *        .command('exec <cmd>')
 *        .description('run the given remote command')
 *        .action(function(cmd) {
 *          console.log('exec "%s"', cmd);
 *        });
 *
 *      program
 *        .command('teardown <dir> [otherDirs...]')
 *        .description('run teardown commands')
 *        .action(function(dir, otherDirs) {
 *          console.log('dir "%s"', dir);
 *          if (otherDirs) {
 *            otherDirs.forEach(function (oDir) {
 *              console.log('dir "%s"', oDir);
 *            });
 *          }
 *        });
 *
 *      program
 *        .command('*')
 *        .description('deploy the given env')
 *        .action(function(env) {
 *          console.log('deploying "%s"', env);
 *        });
 *
 *      program.parse(process.argv);
  *
 * @param {String} name
 * @param {String} [desc] for git-style sub-commands
 * @return {Command} the new command
 * @api public
 */

_commanderindexjs290_Command.prototype.command = function (name, desc, opts) {
  opts = opts || {};
  var args = name.split(/ +/);
  var cmd = new _commanderindexjs290_Command(args.shift());

  if (desc) {
    cmd.description(desc);
    this.executables = true;
    this._execs[cmd._name] = true;
    if (opts.isDefault) this.defaultExecutable = cmd._name;
  }

  cmd._noHelp = !!opts.noHelp;
  this.commands.push(cmd);
  cmd.parseExpectedArgs(args);
  cmd.parent = this;

  if (desc) return this;
  return cmd;
};

/**
 * Define argument syntax for the top-level command.
 *
 * @api public
 */

_commanderindexjs290_Command.prototype.arguments = function (desc) {
  return this.parseExpectedArgs(desc.split(/ +/));
};

/**
 * Add an implicit `help [cmd]` subcommand
 * which invokes `--help` for the given command.
 *
 * @api private
 */

_commanderindexjs290_Command.prototype.addImplicitHelpCommand = function () {
  this.command('help [cmd]', 'display help for [cmd]');
};

/**
 * Parse expected `args`.
 *
 * For example `["[type]"]` becomes `[{ required: false, name: 'type' }]`.
 *
 * @param {Array} args
 * @return {Command} for chaining
 * @api public
 */

_commanderindexjs290_Command.prototype.parseExpectedArgs = function (args) {
  if (!args.length) return;
  var self = this;
  args.forEach(function (arg) {
    var argDetails = {
      required: false,
      name: '',
      variadic: false
    };

    switch (arg[0]) {
      case '<':
        argDetails.required = true;
        argDetails.name = arg.slice(1, -1);
        break;
      case '[':
        argDetails.name = arg.slice(1, -1);
        break;
    }

    if (argDetails.name.length > 3 && argDetails.name.slice(-3) === '...') {
      argDetails.variadic = true;
      argDetails.name = argDetails.name.slice(0, -3);
    }
    if (argDetails.name) {
      self._args.push(argDetails);
    }
  });
  return this;
};

/**
 * Register callback `fn` for the command.
 *
 * Examples:
 *
 *      program
 *        .command('help')
 *        .description('display verbose help')
 *        .action(function() {
 *           // output help here
 *        });
 *
 * @param {Function} fn
 * @return {Command} for chaining
 * @api public
 */

_commanderindexjs290_Command.prototype.action = function (fn) {
  var self = this;
  var listener = function (args, unknown) {
    // Parse any so-far unknown options
    args = args || [];
    unknown = unknown || [];

    var parsed = self.parseOptions(unknown);

    // Output help if necessary
    _commanderindexjs290_outputHelpIfNecessary(self, parsed.unknown);

    // If there are still any unknown options, then we simply
    // die, unless someone asked for help, in which case we give it
    // to them, and then we die.
    if (parsed.unknown.length > 0) {
      self.unknownOption(parsed.unknown[0]);
    }

    // Leftover arguments need to be pushed back. Fixes issue #56
    if (parsed.args.length) args = parsed.args.concat(args);

    self._args.forEach(function (arg, i) {
      if (arg.required && null == args[i]) {
        self.missingArgument(arg.name);
      } else if (arg.variadic) {
        if (i !== self._args.length - 1) {
          self.variadicArgNotLast(arg.name);
        }

        args[i] = args.splice(i);
      }
    });

    // Always append ourselves to the end of the arguments,
    // to make sure we match the number of arguments the user
    // expects
    if (self._args.length) {
      args[self._args.length] = self;
    } else {
      args.push(self);
    }

    fn.apply(self, args);
  };
  var parent = this.parent || this;
  var name = parent === this ? '*' : this._name;
  parent.on(name, listener);
  if (this._alias) parent.on(this._alias, listener);
  return this;
};

/**
 * Define option with `flags`, `description` and optional
 * coercion `fn`.
 *
 * The `flags` string should contain both the short and long flags,
 * separated by comma, a pipe or space. The following are all valid
 * all will output this way when `--help` is used.
 *
 *    "-p, --pepper"
 *    "-p|--pepper"
 *    "-p --pepper"
 *
 * Examples:
 *
 *     // simple boolean defaulting to false
 *     program.option('-p, --pepper', 'add pepper');
 *
 *     --pepper
 *     program.pepper
 *     // => Boolean
 *
 *     // simple boolean defaulting to true
 *     program.option('-C, --no-cheese', 'remove cheese');
 *
 *     program.cheese
 *     // => true
 *
 *     --no-cheese
 *     program.cheese
 *     // => false
 *
 *     // required argument
 *     program.option('-C, --chdir <path>', 'change the working directory');
 *
 *     --chdir /tmp
 *     program.chdir
 *     // => "/tmp"
 *
 *     // optional argument
 *     program.option('-c, --cheese [type]', 'add cheese [marble]');
 *
 * @param {String} flags
 * @param {String} description
 * @param {Function|Mixed} fn or default
 * @param {Mixed} defaultValue
 * @return {Command} for chaining
 * @api public
 */

_commanderindexjs290_Command.prototype.option = function (flags, description, fn, defaultValue) {
  var self = this,
      option = new _commanderindexjs290_Option(flags, description),
      oname = option.name(),
      name = _commanderindexjs290_camelcase(oname);

  // default as 3rd arg
  if (typeof fn != 'function') {
    if (fn instanceof RegExp) {
      var regex = fn;
      fn = function (val, def) {
        var m = regex.exec(val);
        return m ? m[0] : def;
      };
    } else {
      defaultValue = fn;
      fn = null;
    }
  }

  // preassign default value only for --no-*, [optional], or <required>
  if (false == option.bool || option.optional || option.required) {
    // when --no-* we make sure default is true
    if (false == option.bool) defaultValue = true;
    // preassign only if we have a default
    if (undefined !== defaultValue) self[name] = defaultValue;
  }

  // register the option
  this.options.push(option);

  // when it's passed assign the value
  // and conditionally invoke the callback
  this.on(oname, function (val) {
    // coercion
    if (null !== val && fn) val = fn(val, undefined === self[name] ? defaultValue : self[name]);

    // unassigned or bool
    if ('boolean' == typeof self[name] || 'undefined' == typeof self[name]) {
      // if no value, bool true, and we have a default, then use it!
      if (null == val) {
        self[name] = option.bool ? defaultValue || true : false;
      } else {
        self[name] = val;
      }
    } else if (null !== val) {
      // reassign
      self[name] = val;
    }
  });

  return this;
};

/**
 * Allow unknown options on the command line.
 *
 * @param {Boolean} arg if `true` or omitted, no error will be thrown
 * for unknown options.
 * @api public
 */
_commanderindexjs290_Command.prototype.allowUnknownOption = function (arg) {
  this._allowUnknownOption = arguments.length === 0 || arg;
  return this;
};

/**
 * Parse `argv`, settings options and invoking commands when defined.
 *
 * @param {Array} argv
 * @return {Command} for chaining
 * @api public
 */

_commanderindexjs290_Command.prototype.parse = function (argv) {
  // implicit help
  if (this.executables) this.addImplicitHelpCommand();

  // store raw args
  this.rawArgs = argv;

  // guess name
  this._name = this._name || _commanderindexjs290_basename(argv[1], '.js');

  // github-style sub-commands with no sub-command
  if (this.executables && argv.length < 3 && !this.defaultExecutable) {
    // this user needs help
    argv.push('--help');
  }

  // process argv
  var parsed = this.parseOptions(this.normalize(argv.slice(2)));
  var args = this.args = parsed.args;

  var result = this.parseArgs(this.args, parsed.unknown);

  // executable sub-commands
  var name = result.args[0];
  if (this._execs[name] && typeof this._execs[name] != "function") {
    return this.executeSubCommand(argv, args, parsed.unknown);
  } else if (this.defaultExecutable) {
    // use the default subcommand
    args.unshift(name = this.defaultExecutable);
    return this.executeSubCommand(argv, args, parsed.unknown);
  }

  return result;
};

/**
 * Execute a sub-command executable.
 *
 * @param {Array} argv
 * @param {Array} args
 * @param {Array} unknown
 * @api private
 */

_commanderindexjs290_Command.prototype.executeSubCommand = function (argv, args, unknown) {
  args = args.concat(unknown);

  if (!args.length) this.help();
  if ('help' == args[0] && 1 == args.length) this.help();

  // <cmd> --help
  if ('help' == args[0]) {
    args[0] = args[1];
    args[1] = '--help';
  }

  // executable
  var f = argv[1];
  // name of the subcommand, link `pm-install`
  var bin = _commanderindexjs290_basename(f, '.js') + '-' + args[0];

  // In case of globally installed, get the base dir where executable
  //  subcommand file should be located at
  var baseDir,
      link = _commanderindexjs290_readlink(f);

  // when symbolink is relative path
  if (link !== f && link.charAt(0) !== '/') {
    link = _commanderindexjs290_path.join(_commanderindexjs290_dirname(f), link);
  }
  baseDir = _commanderindexjs290_dirname(link);

  // prefer local `./<bin>` to bin in the $PATH
  var localBin = _commanderindexjs290_path.join(baseDir, bin);

  // whether bin file is a js script with explicit `.js` extension
  var isExplicitJS = false;
  if (_commanderindexjs290_exists(localBin + '.js')) {
    bin = localBin + '.js';
    isExplicitJS = true;
  } else if (_commanderindexjs290_exists(localBin)) {
    bin = localBin;
  }

  args = args.slice(1);

  var proc;
  if (process.platform !== 'win32') {
    if (isExplicitJS) {
      args.unshift(localBin);
      // add executable arguments to spawn
      args = (process.execArgv || []).concat(args);

      proc = _commanderindexjs290_spawn('node', args, { stdio: 'inherit', customFds: [0, 1, 2] });
    } else {
      proc = _commanderindexjs290_spawn(bin, args, { stdio: 'inherit', customFds: [0, 1, 2] });
    }
  } else {
    args.unshift(localBin);
    proc = _commanderindexjs290_spawn(process.execPath, args, { stdio: 'inherit' });
  }

  proc.on('close', process.exit.bind(process));
  proc.on('error', function (err) {
    if (err.code == "ENOENT") {
      console.error('\n  %s(1) does not exist, try --help\n', bin);
    } else if (err.code == "EACCES") {
      console.error('\n  %s(1) not executable. try chmod or run with root\n', bin);
    }
    process.exit(1);
  });

  // Store the reference to the child process
  this.runningCommand = proc;
};

/**
 * Normalize `args`, splitting joined short flags. For example
 * the arg "-abc" is equivalent to "-a -b -c".
 * This also normalizes equal sign and splits "--abc=def" into "--abc def".
 *
 * @param {Array} args
 * @return {Array}
 * @api private
 */

_commanderindexjs290_Command.prototype.normalize = function (args) {
  var ret = [],
      arg,
      lastOpt,
      index;

  for (var i = 0, len = args.length; i < len; ++i) {
    arg = args[i];
    if (i > 0) {
      lastOpt = this.optionFor(args[i - 1]);
    }

    if (arg === '--') {
      // Honor option terminator
      ret = ret.concat(args.slice(i));
      break;
    } else if (lastOpt && lastOpt.required) {
      ret.push(arg);
    } else if (arg.length > 1 && '-' == arg[0] && '-' != arg[1]) {
      arg.slice(1).split('').forEach(function (c) {
        ret.push('-' + c);
      });
    } else if (/^--/.test(arg) && ~(index = arg.indexOf('='))) {
      ret.push(arg.slice(0, index), arg.slice(index + 1));
    } else {
      ret.push(arg);
    }
  }

  return ret;
};

/**
 * Parse command `args`.
 *
 * When listener(s) are available those
 * callbacks are invoked, otherwise the "*"
 * event is emitted and those actions are invoked.
 *
 * @param {Array} args
 * @return {Command} for chaining
 * @api private
 */

_commanderindexjs290_Command.prototype.parseArgs = function (args, unknown) {
  var name;

  if (args.length) {
    name = args[0];
    if (this.listeners(name).length) {
      this.emit(args.shift(), args, unknown);
    } else {
      this.emit('*', args);
    }
  } else {
    _commanderindexjs290_outputHelpIfNecessary(this, unknown);

    // If there were no args and we have unknown options,
    // then they are extraneous and we need to error.
    if (unknown.length > 0) {
      this.unknownOption(unknown[0]);
    }
  }

  return this;
};

/**
 * Return an option matching `arg` if any.
 *
 * @param {String} arg
 * @return {Option}
 * @api private
 */

_commanderindexjs290_Command.prototype.optionFor = function (arg) {
  for (var i = 0, len = this.options.length; i < len; ++i) {
    if (this.options[i].is(arg)) {
      return this.options[i];
    }
  }
};

/**
 * Parse options from `argv` returning `argv`
 * void of these options.
 *
 * @param {Array} argv
 * @return {Array}
 * @api public
 */

_commanderindexjs290_Command.prototype.parseOptions = function (argv) {
  var args = [],
      len = argv.length,
      literal,
      option,
      arg;

  var unknownOptions = [];

  // parse options
  for (var i = 0; i < len; ++i) {
    arg = argv[i];

    // literal args after --
    if ('--' == arg) {
      literal = true;
      continue;
    }

    if (literal) {
      args.push(arg);
      continue;
    }

    // find matching Option
    option = this.optionFor(arg);

    // option is defined
    if (option) {
      // requires arg
      if (option.required) {
        arg = argv[++i];
        if (null == arg) return this.optionMissingArgument(option);
        this.emit(option.name(), arg);
        // optional arg
      } else if (option.optional) {
        arg = argv[i + 1];
        if (null == arg || '-' == arg[0] && '-' != arg) {
          arg = null;
        } else {
          ++i;
        }
        this.emit(option.name(), arg);
        // bool
      } else {
        this.emit(option.name());
      }
      continue;
    }

    // looks like an option
    if (arg.length > 1 && '-' == arg[0]) {
      unknownOptions.push(arg);

      // If the next argument looks like it might be
      // an argument for this option, we pass it on.
      // If it isn't, then it'll simply be ignored
      if (argv[i + 1] && '-' != argv[i + 1][0]) {
        unknownOptions.push(argv[++i]);
      }
      continue;
    }

    // arg
    args.push(arg);
  }

  return { args: args, unknown: unknownOptions };
};

/**
 * Return an object containing options as key-value pairs
 *
 * @return {Object}
 * @api public
 */
_commanderindexjs290_Command.prototype.opts = function () {
  var result = {},
      len = this.options.length;

  for (var i = 0; i < len; i++) {
    var key = _commanderindexjs290_camelcase(this.options[i].name());
    result[key] = key === 'version' ? this._version : this[key];
  }
  return result;
};

/**
 * Argument `name` is missing.
 *
 * @param {String} name
 * @api private
 */

_commanderindexjs290_Command.prototype.missingArgument = function (name) {
  console.error();
  console.error("  error: missing required argument `%s'", name);
  console.error();
  process.exit(1);
};

/**
 * `Option` is missing an argument, but received `flag` or nothing.
 *
 * @param {String} option
 * @param {String} flag
 * @api private
 */

_commanderindexjs290_Command.prototype.optionMissingArgument = function (option, flag) {
  console.error();
  if (flag) {
    console.error("  error: option `%s' argument missing, got `%s'", option.flags, flag);
  } else {
    console.error("  error: option `%s' argument missing", option.flags);
  }
  console.error();
  process.exit(1);
};

/**
 * Unknown option `flag`.
 *
 * @param {String} flag
 * @api private
 */

_commanderindexjs290_Command.prototype.unknownOption = function (flag) {
  if (this._allowUnknownOption) return;
  console.error();
  console.error("  error: unknown option `%s'", flag);
  console.error();
  process.exit(1);
};

/**
 * Variadic argument with `name` is not the last argument as required.
 *
 * @param {String} name
 * @api private
 */

_commanderindexjs290_Command.prototype.variadicArgNotLast = function (name) {
  console.error();
  console.error("  error: variadic arguments must be last `%s'", name);
  console.error();
  process.exit(1);
};

/**
 * Set the program version to `str`.
 *
 * This method auto-registers the "-V, --version" flag
 * which will print the version number when passed.
 *
 * @param {String} str
 * @param {String} flags
 * @return {Command} for chaining
 * @api public
 */

_commanderindexjs290_Command.prototype.version = function (str, flags) {
  if (0 == arguments.length) return this._version;
  this._version = str;
  flags = flags || '-V, --version';
  this.option(flags, 'output the version number');
  this.on('version', function () {
    process.stdout.write(str + '\n');
    process.exit(0);
  });
  return this;
};

/**
 * Set the description to `str`.
 *
 * @param {String} str
 * @return {String|Command}
 * @api public
 */

_commanderindexjs290_Command.prototype.description = function (str) {
  if (0 === arguments.length) return this._description;
  this._description = str;
  return this;
};

/**
 * Set an alias for the command
 *
 * @param {String} alias
 * @return {String|Command}
 * @api public
 */

_commanderindexjs290_Command.prototype.alias = function (alias) {
  if (0 == arguments.length) return this._alias;
  this._alias = alias;
  return this;
};

/**
 * Set / get the command usage `str`.
 *
 * @param {String} str
 * @return {String|Command}
 * @api public
 */

_commanderindexjs290_Command.prototype.usage = function (str) {
  var args = this._args.map(function (arg) {
    return _commanderindexjs290_humanReadableArgName(arg);
  });

  var usage = '[options]' + (this.commands.length ? ' [command]' : '') + (this._args.length ? ' ' + args.join(' ') : '');

  if (0 == arguments.length) return this._usage || usage;
  this._usage = str;

  return this;
};

/**
 * Get the name of the command
 *
 * @param {String} name
 * @return {String|Command}
 * @api public
 */

_commanderindexjs290_Command.prototype.name = function () {
  return this._name;
};

/**
 * Return the largest option length.
 *
 * @return {Number}
 * @api private
 */

_commanderindexjs290_Command.prototype.largestOptionLength = function () {
  return this.options.reduce(function (max, option) {
    return Math.max(max, option.flags.length);
  }, 0);
};

/**
 * Return help for options.
 *
 * @return {String}
 * @api private
 */

_commanderindexjs290_Command.prototype.optionHelp = function () {
  var width = this.largestOptionLength();

  // Prepend the help information
  return [_commanderindexjs290_pad('-h, --help', width) + '  ' + 'output usage information'].concat(this.options.map(function (option) {
    return _commanderindexjs290_pad(option.flags, width) + '  ' + option.description;
  })).join('\n');
};

/**
 * Return command help documentation.
 *
 * @return {String}
 * @api private
 */

_commanderindexjs290_Command.prototype.commandHelp = function () {
  if (!this.commands.length) return '';

  var commands = this.commands.filter(function (cmd) {
    return !cmd._noHelp;
  }).map(function (cmd) {
    var args = cmd._args.map(function (arg) {
      return _commanderindexjs290_humanReadableArgName(arg);
    }).join(' ');

    return [cmd._name + (cmd._alias ? '|' + cmd._alias : '') + (cmd.options.length ? ' [options]' : '') + ' ' + args, cmd.description()];
  });

  var width = commands.reduce(function (max, command) {
    return Math.max(max, command[0].length);
  }, 0);

  return ['', '  Commands:', '', commands.map(function (cmd) {
    var desc = cmd[1] ? '  ' + cmd[1] : '';
    return _commanderindexjs290_pad(cmd[0], width) + desc;
  }).join('\n').replace(/^/gm, '    '), ''].join('\n');
};

/**
 * Return program help documentation.
 *
 * @return {String}
 * @api private
 */

_commanderindexjs290_Command.prototype.helpInformation = function () {
  var desc = [];
  if (this._description) {
    desc = ['  ' + this._description, ''];
  }

  var cmdName = this._name;
  if (this._alias) {
    cmdName = cmdName + '|' + this._alias;
  }
  var usage = ['', '  Usage: ' + cmdName + ' ' + this.usage(), ''];

  var cmds = [];
  var commandHelp = this.commandHelp();
  if (commandHelp) cmds = [commandHelp];

  var options = ['  Options:', '', '' + this.optionHelp().replace(/^/gm, '    '), '', ''];

  return usage.concat(cmds).concat(desc).concat(options).join('\n');
};

/**
 * Output help information for this command
 *
 * @api public
 */

_commanderindexjs290_Command.prototype.outputHelp = function (cb) {
  if (!cb) {
    cb = function (passthru) {
      return passthru;
    };
  }
  process.stdout.write(cb(this.helpInformation()));
  this.emit('--help');
};

/**
 * Output help information and exit.
 *
 * @api public
 */

_commanderindexjs290_Command.prototype.help = function (cb) {
  this.outputHelp(cb);
  process.exit();
};

/**
 * Camel-case the given `flag`
 *
 * @param {String} flag
 * @return {String}
 * @api private
 */

function _commanderindexjs290_camelcase(flag) {
  return flag.split('-').reduce(function (str, word) {
    return str + word[0].toUpperCase() + word.slice(1);
  });
}

/**
 * Pad `str` to `width`.
 *
 * @param {String} str
 * @param {Number} width
 * @return {String}
 * @api private
 */

function _commanderindexjs290_pad(str, width) {
  var len = Math.max(0, width - str.length);
  return str + Array(len + 1).join(' ');
}

/**
 * Output help information if necessary
 *
 * @param {Command} command to output help for
 * @param {Array} array of options to search for -h or --help
 * @api private
 */

function _commanderindexjs290_outputHelpIfNecessary(cmd, options) {
  options = options || [];
  for (var i = 0; i < options.length; i++) {
    if (options[i] == '--help' || options[i] == '-h') {
      cmd.outputHelp();
      process.exit(0);
    }
  }
}

/**
 * Takes an argument an returns its human readable equivalent for help usage.
 *
 * @param {Object} arg
 * @return {String}
 * @api private
 */

function _commanderindexjs290_humanReadableArgName(arg) {
  var nameOutput = arg.name + (arg.variadic === true ? '...' : '');

  return arg.required ? '<' + nameOutput + '>' : '[' + nameOutput + ']';
}

// for versions before node v0.8 when there weren't `fs.existsSync`
function _commanderindexjs290_exists(file) {
  try {
    if (_commanderindexjs290_fs.statSync(file).isFile()) {
      return true;
    }
  } catch (e) {
    return false;
  }
}
/*≠≠ node_modules/commander/index.js ≠≠*/

/*== node_modules/recur-fs/lib/walk.js ==*/
$m['recur-fs/lib/walk.js#2.2.3'] = { exports: {} };
var _recurfslibwalkjs223_fs = require('fs'),
    _recurfslibwalkjs223_path = require('path');

/**
 * Walk directory tree from 'dir', passing all resources to 'visitor'.
 * Stops walking if 'visitor' calls next(true), or root directory reached.
 * @param {String} dir
 * @param {Function} visitor(resource, stat, next)
 * @param {Function} fn(err)
 */
$m['recur-fs/lib/walk.js#2.2.3'].exports = function walk(dir, visitor, fn) {
	dir = _recurfslibwalkjs223_path.resolve(dir);

	function visit(dir) {
		function next(finished) {
			var parent = _recurfslibwalkjs223_path.resolve(dir, '..');

			// Stop if finished or we can no longer go up a level
			if (finished || parent.toLowerCase() === dir.toLowerCase()) return fn();

			// Up one level
			visit(parent);
		}

		_recurfslibwalkjs223_fs.readdir(dir, function (err, files) {
			if (err) return fn(err);

			var outstanding = files.length,
			    finished = false;

			files.forEach(function (file) {
				file = _recurfslibwalkjs223_path.join(dir, file);
				_recurfslibwalkjs223_fs.stat(file, function (err, stat) {
					if (!finished) {
						// Skip on error
						if (err) return ! --outstanding ? next(finished) : null;

						visitor(file, stat, function (stop) {
							if (stop === true) finished = true;

							if (! --outstanding) next(finished);
						});

						// Already finished
					} else {
						if (! --outstanding) return fn();
					}
				});
			});
		});
	}

	visit(dir);
};

/**
 * Synchronously walk directory tree from 'directory', passing all resources to 'visitor'.
 * Stops walking when root directory reached or `true` is returned from 'visitor'.
 * @param {String} dir
 * @param {Function} visitor(resource)
 */
$m['recur-fs/lib/walk.js#2.2.3'].exports.sync = function walkSync(directory, visitor) {
	directory = _recurfslibwalkjs223_path.resolve(directory);

	function visit(dir) {
		function next() {
			var parent = _recurfslibwalkjs223_path.resolve(dir, '..');

			// Stop if we can no longer go up a level
			if (parent.toLowerCase() === dir.toLowerCase()) return;

			// Up one level
			visit(parent);
		}

		var files = _recurfslibwalkjs223_fs.readdirSync(dir),
		    outstanding = files.length,
		    finished = false;

		files.forEach(function (file) {
			file = _recurfslibwalkjs223_path.join(dir, file);
			try {
				var stat = _recurfslibwalkjs223_fs.statSync(file);
			} catch (err) {
				// Skip if error
				return ! --outstanding ? next() : null;
			}

			if (!finished) {
				var stop = visitor(file, stat);
				if (stop === true) finished = true;
				if (! --outstanding && !finished) return next();
			}
		});
	}

	visit(directory);
};
/*≠≠ node_modules/recur-fs/lib/walk.js ≠≠*/

/*== node_modules/balanced-match/index.js ==*/
$m['balanced-match/index.js#0.4.2'] = { exports: {} };
$m['balanced-match/index.js#0.4.2'].exports = _balancedmatchindexjs042_balanced;
function _balancedmatchindexjs042_balanced(a, b, str) {
  if (a instanceof RegExp) a = _balancedmatchindexjs042_maybeMatch(a, str);
  if (b instanceof RegExp) b = _balancedmatchindexjs042_maybeMatch(b, str);

  var r = _balancedmatchindexjs042_range(a, b, str);

  return r && {
    start: r[0],
    end: r[1],
    pre: str.slice(0, r[0]),
    body: str.slice(r[0] + a.length, r[1]),
    post: str.slice(r[1] + b.length)
  };
}

function _balancedmatchindexjs042_maybeMatch(reg, str) {
  var m = str.match(reg);
  return m ? m[0] : null;
}

_balancedmatchindexjs042_balanced.range = _balancedmatchindexjs042_range;
function _balancedmatchindexjs042_range(a, b, str) {
  var begs, beg, left, right, result;
  var ai = str.indexOf(a);
  var bi = str.indexOf(b, ai + 1);
  var i = ai;

  if (ai >= 0 && bi > 0) {
    begs = [];
    left = str.length;

    while (i >= 0 && !result) {
      if (i == ai) {
        begs.push(i);
        ai = str.indexOf(a, i + 1);
      } else if (begs.length == 1) {
        result = [begs.pop(), bi];
      } else {
        beg = begs.pop();
        if (beg < left) {
          left = beg;
          right = bi;
        }

        bi = str.indexOf(b, i + 1);
      }

      i = ai < bi && ai >= 0 ? ai : bi;
    }

    if (begs.length) {
      result = [left, right];
    }
  }

  return result;
}
/*≠≠ node_modules/balanced-match/index.js ≠≠*/

/*== node_modules/concat-map/index.js ==*/
$m['concat-map/index.js#0.0.1'] = { exports: {} };
$m['concat-map/index.js#0.0.1'].exports = function (xs, fn) {
    var res = [];
    for (var i = 0; i < xs.length; i++) {
        var x = fn(xs[i], i);
        if (_concatmapindexjs001_isArray(x)) res.push.apply(res, x);else res.push(x);
    }
    return res;
};

var _concatmapindexjs001_isArray = Array.isArray || function (xs) {
    return Object.prototype.toString.call(xs) === '[object Array]';
};
/*≠≠ node_modules/concat-map/index.js ≠≠*/

/*== node_modules/brace-expansion/index.js ==*/
$m['brace-expansion/index.js#1.1.6'] = { exports: {} };
var _braceexpansionindexjs116_concatMap = $m['concat-map/index.js#0.0.1'].exports;
var _braceexpansionindexjs116_balanced = $m['balanced-match/index.js#0.4.2'].exports;

$m['brace-expansion/index.js#1.1.6'].exports = _braceexpansionindexjs116_expandTop;

var _braceexpansionindexjs116_escSlash = '\0SLASH' + Math.random() + '\0';
var _braceexpansionindexjs116_escOpen = '\0OPEN' + Math.random() + '\0';
var _braceexpansionindexjs116_escClose = '\0CLOSE' + Math.random() + '\0';
var _braceexpansionindexjs116_escComma = '\0COMMA' + Math.random() + '\0';
var _braceexpansionindexjs116_escPeriod = '\0PERIOD' + Math.random() + '\0';

function _braceexpansionindexjs116_numeric(str) {
  return parseInt(str, 10) == str ? parseInt(str, 10) : str.charCodeAt(0);
}

function _braceexpansionindexjs116_escapeBraces(str) {
  return str.split('\\\\').join(_braceexpansionindexjs116_escSlash).split('\\{').join(_braceexpansionindexjs116_escOpen).split('\\}').join(_braceexpansionindexjs116_escClose).split('\\,').join(_braceexpansionindexjs116_escComma).split('\\.').join(_braceexpansionindexjs116_escPeriod);
}

function _braceexpansionindexjs116_unescapeBraces(str) {
  return str.split(_braceexpansionindexjs116_escSlash).join('\\').split(_braceexpansionindexjs116_escOpen).join('{').split(_braceexpansionindexjs116_escClose).join('}').split(_braceexpansionindexjs116_escComma).join(',').split(_braceexpansionindexjs116_escPeriod).join('.');
}

// Basically just str.split(","), but handling cases
// where we have nested braced sections, which should be
// treated as individual members, like {a,{b,c},d}
function _braceexpansionindexjs116_parseCommaParts(str) {
  if (!str) return [''];

  var parts = [];
  var m = _braceexpansionindexjs116_balanced('{', '}', str);

  if (!m) return str.split(',');

  var pre = m.pre;
  var body = m.body;
  var post = m.post;
  var p = pre.split(',');

  p[p.length - 1] += '{' + body + '}';
  var postParts = _braceexpansionindexjs116_parseCommaParts(post);
  if (post.length) {
    p[p.length - 1] += postParts.shift();
    p.push.apply(p, postParts);
  }

  parts.push.apply(parts, p);

  return parts;
}

function _braceexpansionindexjs116_expandTop(str) {
  if (!str) return [];

  // I don't know why Bash 4.3 does this, but it does.
  // Anything starting with {} will have the first two bytes preserved
  // but *only* at the top level, so {},a}b will not expand to anything,
  // but a{},b}c will be expanded to [a}c,abc].
  // One could argue that this is a bug in Bash, but since the goal of
  // this module is to match Bash's rules, we escape a leading {}
  if (str.substr(0, 2) === '{}') {
    str = '\\{\\}' + str.substr(2);
  }

  return _braceexpansionindexjs116_expand(_braceexpansionindexjs116_escapeBraces(str), true).map(_braceexpansionindexjs116_unescapeBraces);
}

function _braceexpansionindexjs116_identity(e) {
  return e;
}

function _braceexpansionindexjs116_embrace(str) {
  return '{' + str + '}';
}
function _braceexpansionindexjs116_isPadded(el) {
  return (/^-?0\d/.test(el)
  );
}

function _braceexpansionindexjs116_lte(i, y) {
  return i <= y;
}
function _braceexpansionindexjs116_gte(i, y) {
  return i >= y;
}

function _braceexpansionindexjs116_expand(str, isTop) {
  var expansions = [];

  var m = _braceexpansionindexjs116_balanced('{', '}', str);
  if (!m || /\$$/.test(m.pre)) return [str];

  var isNumericSequence = /^-?\d+\.\.-?\d+(?:\.\.-?\d+)?$/.test(m.body);
  var isAlphaSequence = /^[a-zA-Z]\.\.[a-zA-Z](?:\.\.-?\d+)?$/.test(m.body);
  var isSequence = isNumericSequence || isAlphaSequence;
  var isOptions = /^(.*,)+(.+)?$/.test(m.body);
  if (!isSequence && !isOptions) {
    // {a},b}
    if (m.post.match(/,.*\}/)) {
      str = m.pre + '{' + m.body + _braceexpansionindexjs116_escClose + m.post;
      return _braceexpansionindexjs116_expand(str);
    }
    return [str];
  }

  var n;
  if (isSequence) {
    n = m.body.split(/\.\./);
  } else {
    n = _braceexpansionindexjs116_parseCommaParts(m.body);
    if (n.length === 1) {
      // x{{a,b}}y ==> x{a}y x{b}y
      n = _braceexpansionindexjs116_expand(n[0], false).map(_braceexpansionindexjs116_embrace);
      if (n.length === 1) {
        var post = m.post.length ? _braceexpansionindexjs116_expand(m.post, false) : [''];
        return post.map(function (p) {
          return m.pre + n[0] + p;
        });
      }
    }
  }

  // at this point, n is the parts, and we know it's not a comma set
  // with a single entry.

  // no need to expand pre, since it is guaranteed to be free of brace-sets
  var pre = m.pre;
  var post = m.post.length ? _braceexpansionindexjs116_expand(m.post, false) : [''];

  var N;

  if (isSequence) {
    var x = _braceexpansionindexjs116_numeric(n[0]);
    var y = _braceexpansionindexjs116_numeric(n[1]);
    var width = Math.max(n[0].length, n[1].length);
    var incr = n.length == 3 ? Math.abs(_braceexpansionindexjs116_numeric(n[2])) : 1;
    var test = _braceexpansionindexjs116_lte;
    var reverse = y < x;
    if (reverse) {
      incr *= -1;
      test = _braceexpansionindexjs116_gte;
    }
    var pad = n.some(_braceexpansionindexjs116_isPadded);

    N = [];

    for (var i = x; test(i, y); i += incr) {
      var c;
      if (isAlphaSequence) {
        c = String.fromCharCode(i);
        if (c === '\\') c = '';
      } else {
        c = String(i);
        if (pad) {
          var need = width - c.length;
          if (need > 0) {
            var z = new Array(need + 1).join('0');
            if (i < 0) c = '-' + z + c.slice(1);else c = z + c;
          }
        }
      }
      N.push(c);
    }
  } else {
    N = _braceexpansionindexjs116_concatMap(n, function (el) {
      return _braceexpansionindexjs116_expand(el, false);
    });
  }

  for (var j = 0; j < N.length; j++) {
    for (var k = 0; k < post.length; k++) {
      var expansion = pre + N[j] + post[k];
      if (!isTop || isSequence || expansion) expansions.push(expansion);
    }
  }

  return expansions;
}
/*≠≠ node_modules/brace-expansion/index.js ≠≠*/

/*== node_modules/minimatch/minimatch.js ==*/
$m['minimatch/minimatch.js#3.0.2'] = { exports: {} };
$m['minimatch/minimatch.js#3.0.2'].exports = _minimatchminimatchjs302_minimatch;
_minimatchminimatchjs302_minimatch.Minimatch = _minimatchminimatchjs302_Minimatch;

var _minimatchminimatchjs302_path = { sep: '/' };
try {
  _minimatchminimatchjs302_path = require('path');
} catch (er) {}

var _minimatchminimatchjs302_GLOBSTAR = _minimatchminimatchjs302_minimatch.GLOBSTAR = _minimatchminimatchjs302_Minimatch.GLOBSTAR = {};
var _minimatchminimatchjs302_expand = $m['brace-expansion/index.js#1.1.6'].exports;

// any single thing other than /
// don't need to escape / when using new RegExp()
var _minimatchminimatchjs302_qmark = '[^/]';

// * => any number of characters
var _minimatchminimatchjs302_star = _minimatchminimatchjs302_qmark + '*?';

// ** when dots are allowed.  Anything goes, except .. and .
// not (^ or / followed by one or two dots followed by $ or /),
// followed by anything, any number of times.
var _minimatchminimatchjs302_twoStarDot = '(?:(?!(?:\\\/|^)(?:\\.{1,2})($|\\\/)).)*?';

// not a ^ or / followed by a dot,
// followed by anything, any number of times.
var _minimatchminimatchjs302_twoStarNoDot = '(?:(?!(?:\\\/|^)\\.).)*?';

// characters that need to be escaped in RegExp.
var _minimatchminimatchjs302_reSpecials = _minimatchminimatchjs302_charSet('().*{}+?[]^$\\!');

// "abc" -> { a:true, b:true, c:true }
function _minimatchminimatchjs302_charSet(s) {
  return s.split('').reduce(function (set, c) {
    set[c] = true;
    return set;
  }, {});
}

// normalizes slashes.
var _minimatchminimatchjs302_slashSplit = /\/+/;

_minimatchminimatchjs302_minimatch.filter = _minimatchminimatchjs302_filter;
function _minimatchminimatchjs302_filter(pattern, options) {
  options = options || {};
  return function (p, i, list) {
    return _minimatchminimatchjs302_minimatch(p, pattern, options);
  };
}

function _minimatchminimatchjs302_ext(a, b) {
  a = a || {};
  b = b || {};
  var t = {};
  Object.keys(b).forEach(function (k) {
    t[k] = b[k];
  });
  Object.keys(a).forEach(function (k) {
    t[k] = a[k];
  });
  return t;
}

_minimatchminimatchjs302_minimatch.defaults = function (def) {
  if (!def || !Object.keys(def).length) return _minimatchminimatchjs302_minimatch;

  var orig = _minimatchminimatchjs302_minimatch;

  var m = function minimatch(p, pattern, options) {
    return orig.minimatch(p, pattern, _minimatchminimatchjs302_ext(def, options));
  };

  m.Minimatch = function Minimatch(pattern, options) {
    return new orig.Minimatch(pattern, _minimatchminimatchjs302_ext(def, options));
  };

  return m;
};

_minimatchminimatchjs302_Minimatch.defaults = function (def) {
  if (!def || !Object.keys(def).length) return _minimatchminimatchjs302_Minimatch;
  return _minimatchminimatchjs302_minimatch.defaults(def).Minimatch;
};

function _minimatchminimatchjs302_minimatch(p, pattern, options) {
  if (typeof pattern !== 'string') {
    throw new TypeError('glob pattern string required');
  }

  if (!options) options = {};

  // shortcut: comments match nothing.
  if (!options.nocomment && pattern.charAt(0) === '#') {
    return false;
  }

  // "" only matches ""
  if (pattern.trim() === '') return p === '';

  return new _minimatchminimatchjs302_Minimatch(pattern, options).match(p);
}

function _minimatchminimatchjs302_Minimatch(pattern, options) {
  if (!(this instanceof _minimatchminimatchjs302_Minimatch)) {
    return new _minimatchminimatchjs302_Minimatch(pattern, options);
  }

  if (typeof pattern !== 'string') {
    throw new TypeError('glob pattern string required');
  }

  if (!options) options = {};
  pattern = pattern.trim();

  // windows support: need to use /, not \
  if (_minimatchminimatchjs302_path.sep !== '/') {
    pattern = pattern.split(_minimatchminimatchjs302_path.sep).join('/');
  }

  this.options = options;
  this.set = [];
  this.pattern = pattern;
  this.regexp = null;
  this.negate = false;
  this.comment = false;
  this.empty = false;

  // make the set of regexps etc.
  this.make();
}

_minimatchminimatchjs302_Minimatch.prototype.debug = function () {};

_minimatchminimatchjs302_Minimatch.prototype.make = _minimatchminimatchjs302_make;
function _minimatchminimatchjs302_make() {
  // don't do it more than once.
  if (this._made) return;

  var pattern = this.pattern;
  var options = this.options;

  // empty patterns and comments match nothing.
  if (!options.nocomment && pattern.charAt(0) === '#') {
    this.comment = true;
    return;
  }
  if (!pattern) {
    this.empty = true;
    return;
  }

  // step 1: figure out negation, etc.
  this.parseNegate();

  // step 2: expand braces
  var set = this.globSet = this.braceExpand();

  if (options.debug) this.debug = console.error;

  this.debug(this.pattern, set);

  // step 3: now we have a set, so turn each one into a series of path-portion
  // matching patterns.
  // These will be regexps, except in the case of "**", which is
  // set to the GLOBSTAR object for globstar behavior,
  // and will not contain any / characters
  set = this.globParts = set.map(function (s) {
    return s.split(_minimatchminimatchjs302_slashSplit);
  });

  this.debug(this.pattern, set);

  // glob --> regexps
  set = set.map(function (s, si, set) {
    return s.map(this.parse, this);
  }, this);

  this.debug(this.pattern, set);

  // filter out everything that didn't compile properly.
  set = set.filter(function (s) {
    return s.indexOf(false) === -1;
  });

  this.debug(this.pattern, set);

  this.set = set;
}

_minimatchminimatchjs302_Minimatch.prototype.parseNegate = _minimatchminimatchjs302_parseNegate;
function _minimatchminimatchjs302_parseNegate() {
  var pattern = this.pattern;
  var negate = false;
  var options = this.options;
  var negateOffset = 0;

  if (options.nonegate) return;

  for (var i = 0, l = pattern.length; i < l && pattern.charAt(i) === '!'; i++) {
    negate = !negate;
    negateOffset++;
  }

  if (negateOffset) this.pattern = pattern.substr(negateOffset);
  this.negate = negate;
}

// Brace expansion:
// a{b,c}d -> abd acd
// a{b,}c -> abc ac
// a{0..3}d -> a0d a1d a2d a3d
// a{b,c{d,e}f}g -> abg acdfg acefg
// a{b,c}d{e,f}g -> abdeg acdeg abdeg abdfg
//
// Invalid sets are not expanded.
// a{2..}b -> a{2..}b
// a{b}c -> a{b}c
_minimatchminimatchjs302_minimatch.braceExpand = function (pattern, options) {
  return _minimatchminimatchjs302_braceExpand(pattern, options);
};

_minimatchminimatchjs302_Minimatch.prototype.braceExpand = _minimatchminimatchjs302_braceExpand;

function _minimatchminimatchjs302_braceExpand(pattern, options) {
  if (!options) {
    if (this instanceof _minimatchminimatchjs302_Minimatch) {
      options = this.options;
    } else {
      options = {};
    }
  }

  pattern = typeof pattern === 'undefined' ? this.pattern : pattern;

  if (typeof pattern === 'undefined') {
    throw new TypeError('undefined pattern');
  }

  if (options.nobrace || !pattern.match(/\{.*\}/)) {
    // shortcut. no need to expand.
    return [pattern];
  }

  return _minimatchminimatchjs302_expand(pattern);
}

// parse a component of the expanded set.
// At this point, no pattern may contain "/" in it
// so we're going to return a 2d array, where each entry is the full
// pattern, split on '/', and then turned into a regular expression.
// A regexp is made at the end which joins each array with an
// escaped /, and another full one which joins each regexp with |.
//
// Following the lead of Bash 4.1, note that "**" only has special meaning
// when it is the *only* thing in a path portion.  Otherwise, any series
// of * is equivalent to a single *.  Globstar behavior is enabled by
// default, and can be disabled by setting options.noglobstar.
_minimatchminimatchjs302_Minimatch.prototype.parse = _minimatchminimatchjs302_parse;
var _minimatchminimatchjs302_SUBPARSE = {};
function _minimatchminimatchjs302_parse(pattern, isSub) {
  if (pattern.length > 1024 * 64) {
    throw new TypeError('pattern is too long');
  }

  var options = this.options;

  // shortcuts
  if (!options.noglobstar && pattern === '**') return _minimatchminimatchjs302_GLOBSTAR;
  if (pattern === '') return '';

  var re = '';
  var hasMagic = !!options.nocase;
  var escaping = false;
  // ? => one single character
  var patternListStack = [];
  var negativeLists = [];
  var plType;
  var stateChar;
  var inClass = false;
  var reClassStart = -1;
  var classStart = -1;
  // . and .. never match anything that doesn't start with .,
  // even when options.dot is set.
  var patternStart = pattern.charAt(0) === '.' ? '' // anything
  // not (start or / followed by . or .. followed by / or end)
  : options.dot ? '(?!(?:^|\\\/)\\.{1,2}(?:$|\\\/))' : '(?!\\.)';
  var self = this;

  function clearStateChar() {
    if (stateChar) {
      // we had some state-tracking character
      // that wasn't consumed by this pass.
      switch (stateChar) {
        case '*':
          re += _minimatchminimatchjs302_star;
          hasMagic = true;
          break;
        case '?':
          re += _minimatchminimatchjs302_qmark;
          hasMagic = true;
          break;
        default:
          re += '\\' + stateChar;
          break;
      }
      self.debug('clearStateChar %j %j', stateChar, re);
      stateChar = false;
    }
  }

  for (var i = 0, len = pattern.length, c; i < len && (c = pattern.charAt(i)); i++) {
    this.debug('%s\t%s %s %j', pattern, i, re, c);

    // skip over any that are escaped.
    if (escaping && _minimatchminimatchjs302_reSpecials[c]) {
      re += '\\' + c;
      escaping = false;
      continue;
    }

    switch (c) {
      case '/':
        // completely not allowed, even escaped.
        // Should already be path-split by now.
        return false;

      case '\\':
        clearStateChar();
        escaping = true;
        continue;

      // the various stateChar values
      // for the "extglob" stuff.
      case '?':
      case '*':
      case '+':
      case '@':
      case '!':
        this.debug('%s\t%s %s %j <-- stateChar', pattern, i, re, c);

        // all of those are literals inside a class, except that
        // the glob [!a] means [^a] in regexp
        if (inClass) {
          this.debug('  in class');
          if (c === '!' && i === classStart + 1) c = '^';
          re += c;
          continue;
        }

        // if we already have a stateChar, then it means
        // that there was something like ** or +? in there.
        // Handle the stateChar, then proceed with this one.
        self.debug('call clearStateChar %j', stateChar);
        clearStateChar();
        stateChar = c;
        // if extglob is disabled, then +(asdf|foo) isn't a thing.
        // just clear the statechar *now*, rather than even diving into
        // the patternList stuff.
        if (options.noext) clearStateChar();
        continue;

      case '(':
        if (inClass) {
          re += '(';
          continue;
        }

        if (!stateChar) {
          re += '\\(';
          continue;
        }

        plType = stateChar;
        patternListStack.push({
          type: plType,
          start: i - 1,
          reStart: re.length
        });
        // negation is (?:(?!js)[^/]*)
        re += stateChar === '!' ? '(?:(?!(?:' : '(?:';
        this.debug('plType %j %j', stateChar, re);
        stateChar = false;
        continue;

      case ')':
        if (inClass || !patternListStack.length) {
          re += '\\)';
          continue;
        }

        clearStateChar();
        hasMagic = true;
        re += ')';
        var pl = patternListStack.pop();
        plType = pl.type;
        // negation is (?:(?!js)[^/]*)
        // The others are (?:<pattern>)<type>
        switch (plType) {
          case '!':
            negativeLists.push(pl);
            re += ')[^/]*?)';
            pl.reEnd = re.length;
            break;
          case '?':
          case '+':
          case '*':
            re += plType;
            break;
          case '@':
            break; // the default anyway
        }
        continue;

      case '|':
        if (inClass || !patternListStack.length || escaping) {
          re += '\\|';
          escaping = false;
          continue;
        }

        clearStateChar();
        re += '|';
        continue;

      // these are mostly the same in regexp and glob
      case '[':
        // swallow any state-tracking char before the [
        clearStateChar();

        if (inClass) {
          re += '\\' + c;
          continue;
        }

        inClass = true;
        classStart = i;
        reClassStart = re.length;
        re += c;
        continue;

      case ']':
        //  a right bracket shall lose its special
        //  meaning and represent itself in
        //  a bracket expression if it occurs
        //  first in the list.  -- POSIX.2 2.8.3.2
        if (i === classStart + 1 || !inClass) {
          re += '\\' + c;
          escaping = false;
          continue;
        }

        // handle the case where we left a class open.
        // "[z-a]" is valid, equivalent to "\[z-a\]"
        if (inClass) {
          // split where the last [ was, make sure we don't have
          // an invalid re. if so, re-walk the contents of the
          // would-be class to re-translate any characters that
          // were passed through as-is
          // TODO: It would probably be faster to determine this
          // without a try/catch and a new RegExp, but it's tricky
          // to do safely.  For now, this is safe and works.
          var cs = pattern.substring(classStart + 1, i);
          try {
            RegExp('[' + cs + ']');
          } catch (er) {
            // not a valid class!
            var sp = this.parse(cs, _minimatchminimatchjs302_SUBPARSE);
            re = re.substr(0, reClassStart) + '\\[' + sp[0] + '\\]';
            hasMagic = hasMagic || sp[1];
            inClass = false;
            continue;
          }
        }

        // finish up the class.
        hasMagic = true;
        inClass = false;
        re += c;
        continue;

      default:
        // swallow any state char that wasn't consumed
        clearStateChar();

        if (escaping) {
          // no need
          escaping = false;
        } else if (_minimatchminimatchjs302_reSpecials[c] && !(c === '^' && inClass)) {
          re += '\\';
        }

        re += c;

    } // switch
  } // for

  // handle the case where we left a class open.
  // "[abc" is valid, equivalent to "\[abc"
  if (inClass) {
    // split where the last [ was, and escape it
    // this is a huge pita.  We now have to re-walk
    // the contents of the would-be class to re-translate
    // any characters that were passed through as-is
    cs = pattern.substr(classStart + 1);
    sp = this.parse(cs, _minimatchminimatchjs302_SUBPARSE);
    re = re.substr(0, reClassStart) + '\\[' + sp[0];
    hasMagic = hasMagic || sp[1];
  }

  // handle the case where we had a +( thing at the *end*
  // of the pattern.
  // each pattern list stack adds 3 chars, and we need to go through
  // and escape any | chars that were passed through as-is for the regexp.
  // Go through and escape them, taking care not to double-escape any
  // | chars that were already escaped.
  for (pl = patternListStack.pop(); pl; pl = patternListStack.pop()) {
    var tail = re.slice(pl.reStart + 3);
    // maybe some even number of \, then maybe 1 \, followed by a |
    tail = tail.replace(/((?:\\{2}){0,64})(\\?)\|/g, function (_, $1, $2) {
      if (!$2) {
        // the | isn't already escaped, so escape it.
        $2 = '\\';
      }

      // need to escape all those slashes *again*, without escaping the
      // one that we need for escaping the | character.  As it works out,
      // escaping an even number of slashes can be done by simply repeating
      // it exactly after itself.  That's why this trick works.
      //
      // I am sorry that you have to see this.
      return $1 + $1 + $2 + '|';
    });

    this.debug('tail=%j\n   %s', tail, tail);
    var t = pl.type === '*' ? _minimatchminimatchjs302_star : pl.type === '?' ? _minimatchminimatchjs302_qmark : '\\' + pl.type;

    hasMagic = true;
    re = re.slice(0, pl.reStart) + t + '\\(' + tail;
  }

  // handle trailing things that only matter at the very end.
  clearStateChar();
  if (escaping) {
    // trailing \\
    re += '\\\\';
  }

  // only need to apply the nodot start if the re starts with
  // something that could conceivably capture a dot
  var addPatternStart = false;
  switch (re.charAt(0)) {
    case '.':
    case '[':
    case '(':
      addPatternStart = true;
  }

  // Hack to work around lack of negative lookbehind in JS
  // A pattern like: *.!(x).!(y|z) needs to ensure that a name
  // like 'a.xyz.yz' doesn't match.  So, the first negative
  // lookahead, has to look ALL the way ahead, to the end of
  // the pattern.
  for (var n = negativeLists.length - 1; n > -1; n--) {
    var nl = negativeLists[n];

    var nlBefore = re.slice(0, nl.reStart);
    var nlFirst = re.slice(nl.reStart, nl.reEnd - 8);
    var nlLast = re.slice(nl.reEnd - 8, nl.reEnd);
    var nlAfter = re.slice(nl.reEnd);

    nlLast += nlAfter;

    // Handle nested stuff like *(*.js|!(*.json)), where open parens
    // mean that we should *not* include the ) in the bit that is considered
    // "after" the negated section.
    var openParensBefore = nlBefore.split('(').length - 1;
    var cleanAfter = nlAfter;
    for (i = 0; i < openParensBefore; i++) {
      cleanAfter = cleanAfter.replace(/\)[+*?]?/, '');
    }
    nlAfter = cleanAfter;

    var dollar = '';
    if (nlAfter === '' && isSub !== _minimatchminimatchjs302_SUBPARSE) {
      dollar = '$';
    }
    var newRe = nlBefore + nlFirst + nlAfter + dollar + nlLast;
    re = newRe;
  }

  // if the re is not "" at this point, then we need to make sure
  // it doesn't match against an empty path part.
  // Otherwise a/* will match a/, which it should not.
  if (re !== '' && hasMagic) {
    re = '(?=.)' + re;
  }

  if (addPatternStart) {
    re = patternStart + re;
  }

  // parsing just a piece of a larger pattern.
  if (isSub === _minimatchminimatchjs302_SUBPARSE) {
    return [re, hasMagic];
  }

  // skip the regexp for non-magical patterns
  // unescape anything in it, though, so that it'll be
  // an exact match against a file etc.
  if (!hasMagic) {
    return _minimatchminimatchjs302_globUnescape(pattern);
  }

  var flags = options.nocase ? 'i' : '';
  try {
    var regExp = new RegExp('^' + re + '$', flags);
  } catch (er) {
    // If it was an invalid regular expression, then it can't match
    // anything.  This trick looks for a character after the end of
    // the string, which is of course impossible, except in multi-line
    // mode, but it's not a /m regex.
    return new RegExp('$.');
  }

  regExp._glob = pattern;
  regExp._src = re;

  return regExp;
}

_minimatchminimatchjs302_minimatch.makeRe = function (pattern, options) {
  return new _minimatchminimatchjs302_Minimatch(pattern, options || {}).makeRe();
};

_minimatchminimatchjs302_Minimatch.prototype.makeRe = _minimatchminimatchjs302_makeRe;
function _minimatchminimatchjs302_makeRe() {
  if (this.regexp || this.regexp === false) return this.regexp;

  // at this point, this.set is a 2d array of partial
  // pattern strings, or "**".
  //
  // It's better to use .match().  This function shouldn't
  // be used, really, but it's pretty convenient sometimes,
  // when you just want to work with a regex.
  var set = this.set;

  if (!set.length) {
    this.regexp = false;
    return this.regexp;
  }
  var options = this.options;

  var twoStar = options.noglobstar ? _minimatchminimatchjs302_star : options.dot ? _minimatchminimatchjs302_twoStarDot : _minimatchminimatchjs302_twoStarNoDot;
  var flags = options.nocase ? 'i' : '';

  var re = set.map(function (pattern) {
    return pattern.map(function (p) {
      return p === _minimatchminimatchjs302_GLOBSTAR ? twoStar : typeof p === 'string' ? _minimatchminimatchjs302_regExpEscape(p) : p._src;
    }).join('\\\/');
  }).join('|');

  // must match entire pattern
  // ending in a * or ** will make it less strict.
  re = '^(?:' + re + ')$';

  // can match anything, as long as it's not this.
  if (this.negate) re = '^(?!' + re + ').*$';

  try {
    this.regexp = new RegExp(re, flags);
  } catch (ex) {
    this.regexp = false;
  }
  return this.regexp;
}

_minimatchminimatchjs302_minimatch.match = function (list, pattern, options) {
  options = options || {};
  var mm = new _minimatchminimatchjs302_Minimatch(pattern, options);
  list = list.filter(function (f) {
    return mm.match(f);
  });
  if (mm.options.nonull && !list.length) {
    list.push(pattern);
  }
  return list;
};

_minimatchminimatchjs302_Minimatch.prototype.match = _minimatchminimatchjs302_match;
function _minimatchminimatchjs302_match(f, partial) {
  this.debug('match', f, this.pattern);
  // short-circuit in the case of busted things.
  // comments, etc.
  if (this.comment) return false;
  if (this.empty) return f === '';

  if (f === '/' && partial) return true;

  var options = this.options;

  // windows: need to use /, not \
  if (_minimatchminimatchjs302_path.sep !== '/') {
    f = f.split(_minimatchminimatchjs302_path.sep).join('/');
  }

  // treat the test path as a set of pathparts.
  f = f.split(_minimatchminimatchjs302_slashSplit);
  this.debug(this.pattern, 'split', f);

  // just ONE of the pattern sets in this.set needs to match
  // in order for it to be valid.  If negating, then just one
  // match means that we have failed.
  // Either way, return on the first hit.

  var set = this.set;
  this.debug(this.pattern, 'set', set);

  // Find the basename of the path by looking for the last non-empty segment
  var filename;
  var i;
  for (i = f.length - 1; i >= 0; i--) {
    filename = f[i];
    if (filename) break;
  }

  for (i = 0; i < set.length; i++) {
    var pattern = set[i];
    var file = f;
    if (options.matchBase && pattern.length === 1) {
      file = [filename];
    }
    var hit = this.matchOne(file, pattern, partial);
    if (hit) {
      if (options.flipNegate) return true;
      return !this.negate;
    }
  }

  // didn't get any hits.  this is success if it's a negative
  // pattern, failure otherwise.
  if (options.flipNegate) return false;
  return this.negate;
}

// set partial to true to test if, for example,
// "/a/b" matches the start of "/*/b/*/d"
// Partial means, if you run out of file before you run
// out of pattern, then that's fine, as long as all
// the parts match.
_minimatchminimatchjs302_Minimatch.prototype.matchOne = function (file, pattern, partial) {
  var options = this.options;

  this.debug('matchOne', { 'this': this, file: file, pattern: pattern });

  this.debug('matchOne', file.length, pattern.length);

  for (var fi = 0, pi = 0, fl = file.length, pl = pattern.length; fi < fl && pi < pl; fi++, pi++) {
    this.debug('matchOne loop');
    var p = pattern[pi];
    var f = file[fi];

    this.debug(pattern, p, f);

    // should be impossible.
    // some invalid regexp stuff in the set.
    if (p === false) return false;

    if (p === _minimatchminimatchjs302_GLOBSTAR) {
      this.debug('GLOBSTAR', [pattern, p, f]);

      // "**"
      // a/**/b/**/c would match the following:
      // a/b/x/y/z/c
      // a/x/y/z/b/c
      // a/b/x/b/x/c
      // a/b/c
      // To do this, take the rest of the pattern after
      // the **, and see if it would match the file remainder.
      // If so, return success.
      // If not, the ** "swallows" a segment, and try again.
      // This is recursively awful.
      //
      // a/**/b/**/c matching a/b/x/y/z/c
      // - a matches a
      // - doublestar
      //   - matchOne(b/x/y/z/c, b/**/c)
      //     - b matches b
      //     - doublestar
      //       - matchOne(x/y/z/c, c) -> no
      //       - matchOne(y/z/c, c) -> no
      //       - matchOne(z/c, c) -> no
      //       - matchOne(c, c) yes, hit
      var fr = fi;
      var pr = pi + 1;
      if (pr === pl) {
        this.debug('** at the end');
        // a ** at the end will just swallow the rest.
        // We have found a match.
        // however, it will not swallow /.x, unless
        // options.dot is set.
        // . and .. are *never* matched by **, for explosively
        // exponential reasons.
        for (; fi < fl; fi++) {
          if (file[fi] === '.' || file[fi] === '..' || !options.dot && file[fi].charAt(0) === '.') return false;
        }
        return true;
      }

      // ok, let's see if we can swallow whatever we can.
      while (fr < fl) {
        var swallowee = file[fr];

        this.debug('\nglobstar while', file, fr, pattern, pr, swallowee);

        // XXX remove this slice.  Just pass the start index.
        if (this.matchOne(file.slice(fr), pattern.slice(pr), partial)) {
          this.debug('globstar found match!', fr, fl, swallowee);
          // found a match.
          return true;
        } else {
          // can't swallow "." or ".." ever.
          // can only swallow ".foo" when explicitly asked.
          if (swallowee === '.' || swallowee === '..' || !options.dot && swallowee.charAt(0) === '.') {
            this.debug('dot detected!', file, fr, pattern, pr);
            break;
          }

          // ** swallows a segment, and continue.
          this.debug('globstar swallow a segment, and continue');
          fr++;
        }
      }

      // no match was found.
      // However, in partial mode, we can't say this is necessarily over.
      // If there's more *pattern* left, then
      if (partial) {
        // ran out of file
        this.debug('\n>>> no match, partial?', file, fr, pattern, pr);
        if (fr === fl) return true;
      }
      return false;
    }

    // something other than **
    // non-magic patterns just have to match exactly
    // patterns with magic have been turned into regexps.
    var hit;
    if (typeof p === 'string') {
      if (options.nocase) {
        hit = f.toLowerCase() === p.toLowerCase();
      } else {
        hit = f === p;
      }
      this.debug('string match', p, f, hit);
    } else {
      hit = f.match(p);
      this.debug('pattern match', p, f, hit);
    }

    if (!hit) return false;
  }

  // Note: ending in / means that we'll get a final ""
  // at the end of the pattern.  This can only match a
  // corresponding "" at the end of the file.
  // If the file ends in /, then it can only match a
  // a pattern that ends in /, unless the pattern just
  // doesn't have any more for it. But, a/b/ should *not*
  // match "a/b/*", even though "" matches against the
  // [^/]*? pattern, except in partial mode, where it might
  // simply not be reached yet.
  // However, a/b/ should still satisfy a/*

  // now either we fell off the end of the pattern, or we're done.
  if (fi === fl && pi === pl) {
    // ran out of pattern and filename at the same time.
    // an exact hit!
    return true;
  } else if (fi === fl) {
    // ran out of file, but still had pattern left.
    // this is ok if we're doing the match as part of
    // a glob fs traversal.
    return partial;
  } else if (pi === pl) {
    // ran out of pattern, still have file left.
    // this is only acceptable if we're on the very last
    // empty segment of a file with a trailing slash.
    // a/* should match a/b/
    var emptyFileEnd = fi === fl - 1 && file[fi] === '';
    return emptyFileEnd;
  }

  // should be unreachable.
  throw new Error('wtf?');
};

// replace stuff like \* with *
function _minimatchminimatchjs302_globUnescape(s) {
  return s.replace(/\\(.)/g, '$1');
}

function _minimatchminimatchjs302_regExpEscape(s) {
  return s.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}
/*≠≠ node_modules/minimatch/minimatch.js ≠≠*/

/*== node_modules/recur-fs/lib/hunt.js ==*/
$m['recur-fs/lib/hunt.js#2.2.3'] = { exports: {} };
var _recurfslibhuntjs223_fs = require('fs'),
    _recurfslibhuntjs223_Minimatch = $m['minimatch/minimatch.js#3.0.2'].exports.Minimatch,
    _recurfslibhuntjs223_path = require('path'),
    _recurfslibhuntjs223_walk = $m['recur-fs/lib/walk.js#2.2.3'].exports;

/**
 * Walk directory tree from 'directory', returning all resources matching 'matcher'.
 * 'matcher' can be glob string, or function that returns 'isMatch'.
 * Stops walking when root directory reached, on first match if 'stopOnFirstMatch',
 * or if "true" is returned as second argument from 'next'.
 * @param {String} directory
 * @param {String|Function} matcher(resource, stat, next)
 * @param {Boolean} stopOnFirstMatch
 * @param {Function} fn(err, matches)
 */
$m['recur-fs/lib/hunt.js#2.2.3'].exports = function hunt(directory, matcher, stopOnFirstMatch, fn) {
	directory = _recurfslibhuntjs223_path.resolve(directory);

	// Convert glob string to async matcher function
	if ('string' == typeof matcher) {
		var match = new _recurfslibhuntjs223_Minimatch(matcher, { matchBase: true });
		matcher = function matcher(resource, stat, done) {
			done(match.match(resource));
		};
	}

	var matches = [],
	    finished = false;

	// Walk and match each resource
	_recurfslibhuntjs223_walk(directory, function (resource, stat, next) {
		if (!finished) {
			matcher(resource, stat, function (isMatch, stop) {
				if (isMatch) {
					matches.push(resource);
					finished = stopOnFirstMatch;
				}

				if (stop === true) finished = true;

				// Stop walking if finished
				next(finished);
			});
		}
	}, function (err) {
		if (err) return fn(err);
		return fn(null, stopOnFirstMatch ? matches[0] : matches);
	});
};

/**
 * Synchronously walk directory tree from 'directory', returning all resources matching 'matcher'.
 * 'matcher' can be glob string, or function that returns 'isMatch'.
 * Stops walking when root directory reached, or on first match if 'stopOnFirstMatch'.
 * @param {String} directory
 * @param {String|Function} matcher(resource, next)
 * @param {Boolean} stopOnFirstMatch
 * @returns (Array|String}
 */
$m['recur-fs/lib/hunt.js#2.2.3'].exports.sync = function huntSync(directory, matcher, stopOnFirstMatch) {
	directory = _recurfslibhuntjs223_path.resolve(directory);

	if ('string' == typeof matcher) {
		var match = new _recurfslibhuntjs223_Minimatch(matcher, { matchBase: true });
		matcher = function matcher(resource) {
			return match.match(resource);
		};
	}

	var matches = [],
	    finished = false;

	// Walk and match each resource
	_recurfslibhuntjs223_walk.sync(directory, function (resource, stat) {
		if (!finished) {
			var isMatch = matcher(resource, stat);
			if (isMatch) {
				matches.push(resource);
				finished = stopOnFirstMatch;
				if (finished) return true;
			}
		}
	});

	return stopOnFirstMatch ? matches[0] : matches;
};
/*≠≠ node_modules/recur-fs/lib/hunt.js ≠≠*/

/*== node_modules/wrappy/wrappy.js ==*/
$m['wrappy/wrappy.js#1.0.2'] = { exports: {} };
// Returns a wrapper function that returns a wrapped callback
// The wrapper function should do some stuff, and return a
// presumably different callback function.
// This makes sure that own properties are retained, so that
// decorations and such are not lost along the way.
$m['wrappy/wrappy.js#1.0.2'].exports = _wrappywrappyjs102_wrappy;
function _wrappywrappyjs102_wrappy(fn, cb) {
  if (fn && cb) return _wrappywrappyjs102_wrappy(fn)(cb);

  if (typeof fn !== 'function') throw new TypeError('need wrapper function');

  Object.keys(fn).forEach(function (k) {
    wrapper[k] = fn[k];
  });

  return wrapper;

  function wrapper() {
    var args = new Array(arguments.length);
    for (var i = 0; i < args.length; i++) {
      args[i] = arguments[i];
    }
    var ret = fn.apply(this, args);
    var cb = args[args.length - 1];
    if (typeof ret === 'function' && ret !== cb) {
      Object.keys(cb).forEach(function (k) {
        ret[k] = cb[k];
      });
    }
    return ret;
  }
}
/*≠≠ node_modules/wrappy/wrappy.js ≠≠*/

/*== node_modules/once/once.js ==*/
$m['once/once.js#1.4.0'] = { exports: {} };
var _onceoncejs140_wrappy = $m['wrappy/wrappy.js#1.0.2'].exports;
$m['once/once.js#1.4.0'].exports = _onceoncejs140_wrappy(_onceoncejs140_once);
$m['once/once.js#1.4.0'].exports.strict = _onceoncejs140_wrappy(_onceoncejs140_onceStrict);

_onceoncejs140_once.proto = _onceoncejs140_once(function () {
  Object.defineProperty(Function.prototype, 'once', {
    value: function () {
      return _onceoncejs140_once(this);
    },
    configurable: true
  });

  Object.defineProperty(Function.prototype, 'onceStrict', {
    value: function () {
      return _onceoncejs140_onceStrict(this);
    },
    configurable: true
  });
});

function _onceoncejs140_once(fn) {
  var f = function () {
    if (f.called) return f.value;
    f.called = true;
    return f.value = fn.apply(this, arguments);
  };
  f.called = false;
  return f;
}

function _onceoncejs140_onceStrict(fn) {
  var f = function () {
    if (f.called) throw new Error(f.onceError);
    f.called = true;
    return f.value = fn.apply(this, arguments);
  };
  var name = fn.name || 'Function wrapped with `once`';
  f.onceError = name + " shouldn't be called more than once";
  f.called = false;
  return f;
}
/*≠≠ node_modules/once/once.js ≠≠*/

/*== node_modules/inflight/inflight.js ==*/
$m['inflight/inflight.js#1.0.5'] = { exports: {} };
var _inflightinflightjs105_wrappy = $m['wrappy/wrappy.js#1.0.2'].exports;
var _inflightinflightjs105_reqs = Object.create(null);
var _inflightinflightjs105_once = $m['once/once.js#1.4.0'].exports;

$m['inflight/inflight.js#1.0.5'].exports = _inflightinflightjs105_wrappy(_inflightinflightjs105_inflight);

function _inflightinflightjs105_inflight(key, cb) {
  if (_inflightinflightjs105_reqs[key]) {
    _inflightinflightjs105_reqs[key].push(cb);
    return null;
  } else {
    _inflightinflightjs105_reqs[key] = [cb];
    return _inflightinflightjs105_makeres(key);
  }
}

function _inflightinflightjs105_makeres(key) {
  return _inflightinflightjs105_once(function RES() {
    var cbs = _inflightinflightjs105_reqs[key];
    var len = cbs.length;
    var args = _inflightinflightjs105_slice(arguments);
    for (var i = 0; i < len; i++) {
      cbs[i].apply(null, args);
    }
    if (cbs.length > len) {
      // added more in the interim.
      // de-zalgo, just in case, but don't call again.
      cbs.splice(0, len);
      process.nextTick(function () {
        RES.apply(null, args);
      });
    } else {
      delete _inflightinflightjs105_reqs[key];
    }
  });
}

function _inflightinflightjs105_slice(args) {
  var length = args.length;
  var array = [];

  for (var i = 0; i < length; i++) array[i] = args[i];
  return array;
}
/*≠≠ node_modules/inflight/inflight.js ≠≠*/

/*== node_modules/path-is-absolute/index.js ==*/
$m['path-is-absolute/index.js#1.0.0'] = { exports: {} };
'use strict';

function _pathisabsoluteindexjs100_posix(path) {
	return path.charAt(0) === '/';
};

function _pathisabsoluteindexjs100_win32(path) {
	// https://github.com/joyent/node/blob/b3fcc245fb25539909ef1d5eaa01dbf92e168633/lib/path.js#L56
	var splitDeviceRe = /^([a-zA-Z]:|[\\\/]{2}[^\\\/]+[\\\/]+[^\\\/]+)?([\\\/])?([\s\S]*?)$/;
	var result = splitDeviceRe.exec(path);
	var device = result[1] || '';
	var isUnc = !!device && device.charAt(1) !== ':';

	// UNC paths are always absolute
	return !!result[2] || isUnc;
};

$m['path-is-absolute/index.js#1.0.0'].exports = process.platform === 'win32' ? _pathisabsoluteindexjs100_win32 : _pathisabsoluteindexjs100_posix;
$m['path-is-absolute/index.js#1.0.0'].exports.posix = _pathisabsoluteindexjs100_posix;
$m['path-is-absolute/index.js#1.0.0'].exports.win32 = _pathisabsoluteindexjs100_win32;
/*≠≠ node_modules/path-is-absolute/index.js ≠≠*/

/*== node_modules/glob/common.js ==*/
$m['glob/common.js#7.1.0'] = { exports: {} };
$m['glob/common.js#7.1.0'].exports.alphasort = _globcommonjs710_alphasort;
$m['glob/common.js#7.1.0'].exports.alphasorti = _globcommonjs710_alphasorti;
$m['glob/common.js#7.1.0'].exports.setopts = _globcommonjs710_setopts;
$m['glob/common.js#7.1.0'].exports.ownProp = _globcommonjs710_ownProp;
$m['glob/common.js#7.1.0'].exports.makeAbs = _globcommonjs710_makeAbs;
$m['glob/common.js#7.1.0'].exports.finish = _globcommonjs710_finish;
$m['glob/common.js#7.1.0'].exports.mark = _globcommonjs710_mark;
$m['glob/common.js#7.1.0'].exports.isIgnored = _globcommonjs710_isIgnored;
$m['glob/common.js#7.1.0'].exports.childrenIgnored = _globcommonjs710_childrenIgnored;

function _globcommonjs710_ownProp(obj, field) {
  return Object.prototype.hasOwnProperty.call(obj, field);
}

var _globcommonjs710_path = require("path");
var _globcommonjs710_minimatch = $m['minimatch/minimatch.js#3.0.2'].exports;
var _globcommonjs710_isAbsolute = $m['path-is-absolute/index.js#1.0.0'].exports;
var _globcommonjs710_Minimatch = _globcommonjs710_minimatch.Minimatch;

function _globcommonjs710_alphasorti(a, b) {
  return a.toLowerCase().localeCompare(b.toLowerCase());
}

function _globcommonjs710_alphasort(a, b) {
  return a.localeCompare(b);
}

function _globcommonjs710_setupIgnores(self, options) {
  self.ignore = options.ignore || [];

  if (!Array.isArray(self.ignore)) self.ignore = [self.ignore];

  if (self.ignore.length) {
    self.ignore = self.ignore.map(_globcommonjs710_ignoreMap);
  }
}

// ignore patterns are always in dot:true mode.
function _globcommonjs710_ignoreMap(pattern) {
  var gmatcher = null;
  if (pattern.slice(-3) === '/**') {
    var gpattern = pattern.replace(/(\/\*\*)+$/, '');
    gmatcher = new _globcommonjs710_Minimatch(gpattern, { dot: true });
  }

  return {
    matcher: new _globcommonjs710_Minimatch(pattern, { dot: true }),
    gmatcher: gmatcher
  };
}

function _globcommonjs710_setopts(self, pattern, options) {
  if (!options) options = {};

  // base-matching: just use globstar for that.
  if (options.matchBase && -1 === pattern.indexOf("/")) {
    if (options.noglobstar) {
      throw new Error("base matching requires globstar");
    }
    pattern = "**/" + pattern;
  }

  self.silent = !!options.silent;
  self.pattern = pattern;
  self.strict = options.strict !== false;
  self.realpath = !!options.realpath;
  self.realpathCache = options.realpathCache || Object.create(null);
  self.follow = !!options.follow;
  self.dot = !!options.dot;
  self.mark = !!options.mark;
  self.nodir = !!options.nodir;
  if (self.nodir) self.mark = true;
  self.sync = !!options.sync;
  self.nounique = !!options.nounique;
  self.nonull = !!options.nonull;
  self.nosort = !!options.nosort;
  self.nocase = !!options.nocase;
  self.stat = !!options.stat;
  self.noprocess = !!options.noprocess;
  self.absolute = !!options.absolute;

  self.maxLength = options.maxLength || Infinity;
  self.cache = options.cache || Object.create(null);
  self.statCache = options.statCache || Object.create(null);
  self.symlinks = options.symlinks || Object.create(null);

  _globcommonjs710_setupIgnores(self, options);

  self.changedCwd = false;
  var cwd = process.cwd();
  if (!_globcommonjs710_ownProp(options, "cwd")) self.cwd = cwd;else {
    self.cwd = _globcommonjs710_path.resolve(options.cwd);
    self.changedCwd = self.cwd !== cwd;
  }

  self.root = options.root || _globcommonjs710_path.resolve(self.cwd, "/");
  self.root = _globcommonjs710_path.resolve(self.root);
  if (process.platform === "win32") self.root = self.root.replace(/\\/g, "/");

  self.cwdAbs = _globcommonjs710_makeAbs(self, self.cwd);
  self.nomount = !!options.nomount;

  // disable comments and negation in Minimatch.
  // Note that they are not supported in Glob itself anyway.
  options.nonegate = true;
  options.nocomment = true;

  self.minimatch = new _globcommonjs710_Minimatch(pattern, options);
  self.options = self.minimatch.options;
}

function _globcommonjs710_finish(self) {
  var nou = self.nounique;
  var all = nou ? [] : Object.create(null);

  for (var i = 0, l = self.matches.length; i < l; i++) {
    var matches = self.matches[i];
    if (!matches || Object.keys(matches).length === 0) {
      if (self.nonull) {
        // do like the shell, and spit out the literal glob
        var literal = self.minimatch.globSet[i];
        if (nou) all.push(literal);else all[literal] = true;
      }
    } else {
      // had matches
      var m = Object.keys(matches);
      if (nou) all.push.apply(all, m);else m.forEach(function (m) {
        all[m] = true;
      });
    }
  }

  if (!nou) all = Object.keys(all);

  if (!self.nosort) all = all.sort(self.nocase ? _globcommonjs710_alphasorti : _globcommonjs710_alphasort);

  // at *some* point we statted all of these
  if (self.mark) {
    for (var i = 0; i < all.length; i++) {
      all[i] = self._mark(all[i]);
    }
    if (self.nodir) {
      all = all.filter(function (e) {
        var notDir = !/\/$/.test(e);
        var c = self.cache[e] || self.cache[_globcommonjs710_makeAbs(self, e)];
        if (notDir && c) notDir = c !== 'DIR' && !Array.isArray(c);
        return notDir;
      });
    }
  }

  if (self.ignore.length) all = all.filter(function (m) {
    return !_globcommonjs710_isIgnored(self, m);
  });

  self.found = all;
}

function _globcommonjs710_mark(self, p) {
  var abs = _globcommonjs710_makeAbs(self, p);
  var c = self.cache[abs];
  var m = p;
  if (c) {
    var isDir = c === 'DIR' || Array.isArray(c);
    var slash = p.slice(-1) === '/';

    if (isDir && !slash) m += '/';else if (!isDir && slash) m = m.slice(0, -1);

    if (m !== p) {
      var mabs = _globcommonjs710_makeAbs(self, m);
      self.statCache[mabs] = self.statCache[abs];
      self.cache[mabs] = self.cache[abs];
    }
  }

  return m;
}

// lotta situps...
function _globcommonjs710_makeAbs(self, f) {
  var abs = f;
  if (f.charAt(0) === '/') {
    abs = _globcommonjs710_path.join(self.root, f);
  } else if (_globcommonjs710_isAbsolute(f) || f === '') {
    abs = f;
  } else if (self.changedCwd) {
    abs = _globcommonjs710_path.resolve(self.cwd, f);
  } else {
    abs = _globcommonjs710_path.resolve(f);
  }

  if (process.platform === 'win32') abs = abs.replace(/\\/g, '/');

  return abs;
}

// Return true, if pattern ends with globstar '**', for the accompanying parent directory.
// Ex:- If node_modules/** is the pattern, add 'node_modules' to ignore list along with it's contents
function _globcommonjs710_isIgnored(self, path) {
  if (!self.ignore.length) return false;

  return self.ignore.some(function (item) {
    return item.matcher.match(path) || !!(item.gmatcher && item.gmatcher.match(path));
  });
}

function _globcommonjs710_childrenIgnored(self, path) {
  if (!self.ignore.length) return false;

  return self.ignore.some(function (item) {
    return !!(item.gmatcher && item.gmatcher.match(path));
  });
}
/*≠≠ node_modules/glob/common.js ≠≠*/

/*== node_modules/fs.realpath/old.js ==*/
$m['fs.realpath/old.js#1.0.0'] = { exports: {} };
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var _fsrealpatholdjs100_pathModule = require('path');
var _fsrealpatholdjs100_isWindows = process.platform === 'win32';
var _fsrealpatholdjs100_fs = require('fs');

// JavaScript implementation of realpath, ported from node pre-v6

var _fsrealpatholdjs100_DEBUG = process.env.NODE_DEBUG && /fs/.test(process.env.NODE_DEBUG);

function _fsrealpatholdjs100_rethrow() {
  // Only enable in debug mode. A backtrace uses ~1000 bytes of heap space and
  // is fairly slow to generate.
  var callback;
  if (_fsrealpatholdjs100_DEBUG) {
    var backtrace = new Error();
    callback = debugCallback;
  } else callback = missingCallback;

  return callback;

  function debugCallback(err) {
    if (err) {
      backtrace.message = err.message;
      err = backtrace;
      missingCallback(err);
    }
  }

  function missingCallback(err) {
    if (err) {
      if (process.throwDeprecation) throw err; // Forgot a callback but don't know where? Use NODE_DEBUG=fs
      else if (!process.noDeprecation) {
          var msg = 'fs: missing callback ' + (err.stack || err.message);
          if (process.traceDeprecation) console.trace(msg);else console.error(msg);
        }
    }
  }
}

function _fsrealpatholdjs100_maybeCallback(cb) {
  return typeof cb === 'function' ? cb : _fsrealpatholdjs100_rethrow();
}

var _fsrealpatholdjs100_normalize = _fsrealpatholdjs100_pathModule.normalize;

// Regexp that finds the next partion of a (partial) path
// result is [base_with_slash, base], e.g. ['somedir/', 'somedir']
if (_fsrealpatholdjs100_isWindows) {
  var _fsrealpatholdjs100_nextPartRe = /(.*?)(?:[\/\\]+|$)/g;
} else {
  var _fsrealpatholdjs100_nextPartRe = /(.*?)(?:[\/]+|$)/g;
}

// Regex to find the device root, including trailing slash. E.g. 'c:\\'.
if (_fsrealpatholdjs100_isWindows) {
  var _fsrealpatholdjs100_splitRootRe = /^(?:[a-zA-Z]:|[\\\/]{2}[^\\\/]+[\\\/][^\\\/]+)?[\\\/]*/;
} else {
  var _fsrealpatholdjs100_splitRootRe = /^[\/]*/;
}

$m['fs.realpath/old.js#1.0.0'].exports.realpathSync = function realpathSync(p, cache) {
  // make p is absolute
  p = _fsrealpatholdjs100_pathModule.resolve(p);

  if (cache && Object.prototype.hasOwnProperty.call(cache, p)) {
    return cache[p];
  }

  var original = p,
      seenLinks = {},
      knownHard = {};

  // current character position in p
  var pos;
  // the partial path so far, including a trailing slash if any
  var current;
  // the partial path without a trailing slash (except when pointing at a root)
  var base;
  // the partial path scanned in the previous round, with slash
  var previous;

  start();

  function start() {
    // Skip over roots
    var m = _fsrealpatholdjs100_splitRootRe.exec(p);
    pos = m[0].length;
    current = m[0];
    base = m[0];
    previous = '';

    // On windows, check that the root exists. On unix there is no need.
    if (_fsrealpatholdjs100_isWindows && !knownHard[base]) {
      _fsrealpatholdjs100_fs.lstatSync(base);
      knownHard[base] = true;
    }
  }

  // walk down the path, swapping out linked pathparts for their real
  // values
  // NB: p.length changes.
  while (pos < p.length) {
    // find the next part
    _fsrealpatholdjs100_nextPartRe.lastIndex = pos;
    var result = _fsrealpatholdjs100_nextPartRe.exec(p);
    previous = current;
    current += result[0];
    base = previous + result[1];
    pos = _fsrealpatholdjs100_nextPartRe.lastIndex;

    // continue if not a symlink
    if (knownHard[base] || cache && cache[base] === base) {
      continue;
    }

    var resolvedLink;
    if (cache && Object.prototype.hasOwnProperty.call(cache, base)) {
      // some known symbolic link.  no need to stat again.
      resolvedLink = cache[base];
    } else {
      var stat = _fsrealpatholdjs100_fs.lstatSync(base);
      if (!stat.isSymbolicLink()) {
        knownHard[base] = true;
        if (cache) cache[base] = base;
        continue;
      }

      // read the link if it wasn't read before
      // dev/ino always return 0 on windows, so skip the check.
      var linkTarget = null;
      if (!_fsrealpatholdjs100_isWindows) {
        var id = stat.dev.toString(32) + ':' + stat.ino.toString(32);
        if (seenLinks.hasOwnProperty(id)) {
          linkTarget = seenLinks[id];
        }
      }
      if (linkTarget === null) {
        _fsrealpatholdjs100_fs.statSync(base);
        linkTarget = _fsrealpatholdjs100_fs.readlinkSync(base);
      }
      resolvedLink = _fsrealpatholdjs100_pathModule.resolve(previous, linkTarget);
      // track this, if given a cache.
      if (cache) cache[base] = resolvedLink;
      if (!_fsrealpatholdjs100_isWindows) seenLinks[id] = linkTarget;
    }

    // resolve the link, then start over
    p = _fsrealpatholdjs100_pathModule.resolve(resolvedLink, p.slice(pos));
    start();
  }

  if (cache) cache[original] = p;

  return p;
};

$m['fs.realpath/old.js#1.0.0'].exports.realpath = function realpath(p, cache, cb) {
  if (typeof cb !== 'function') {
    cb = _fsrealpatholdjs100_maybeCallback(cache);
    cache = null;
  }

  // make p is absolute
  p = _fsrealpatholdjs100_pathModule.resolve(p);

  if (cache && Object.prototype.hasOwnProperty.call(cache, p)) {
    return process.nextTick(cb.bind(null, null, cache[p]));
  }

  var original = p,
      seenLinks = {},
      knownHard = {};

  // current character position in p
  var pos;
  // the partial path so far, including a trailing slash if any
  var current;
  // the partial path without a trailing slash (except when pointing at a root)
  var base;
  // the partial path scanned in the previous round, with slash
  var previous;

  start();

  function start() {
    // Skip over roots
    var m = _fsrealpatholdjs100_splitRootRe.exec(p);
    pos = m[0].length;
    current = m[0];
    base = m[0];
    previous = '';

    // On windows, check that the root exists. On unix there is no need.
    if (_fsrealpatholdjs100_isWindows && !knownHard[base]) {
      _fsrealpatholdjs100_fs.lstat(base, function (err) {
        if (err) return cb(err);
        knownHard[base] = true;
        LOOP();
      });
    } else {
      process.nextTick(LOOP);
    }
  }

  // walk down the path, swapping out linked pathparts for their real
  // values
  function LOOP() {
    // stop if scanned past end of path
    if (pos >= p.length) {
      if (cache) cache[original] = p;
      return cb(null, p);
    }

    // find the next part
    _fsrealpatholdjs100_nextPartRe.lastIndex = pos;
    var result = _fsrealpatholdjs100_nextPartRe.exec(p);
    previous = current;
    current += result[0];
    base = previous + result[1];
    pos = _fsrealpatholdjs100_nextPartRe.lastIndex;

    // continue if not a symlink
    if (knownHard[base] || cache && cache[base] === base) {
      return process.nextTick(LOOP);
    }

    if (cache && Object.prototype.hasOwnProperty.call(cache, base)) {
      // known symbolic link.  no need to stat again.
      return gotResolvedLink(cache[base]);
    }

    return _fsrealpatholdjs100_fs.lstat(base, gotStat);
  }

  function gotStat(err, stat) {
    if (err) return cb(err);

    // if not a symlink, skip to the next path part
    if (!stat.isSymbolicLink()) {
      knownHard[base] = true;
      if (cache) cache[base] = base;
      return process.nextTick(LOOP);
    }

    // stat & read the link if not read before
    // call gotTarget as soon as the link target is known
    // dev/ino always return 0 on windows, so skip the check.
    if (!_fsrealpatholdjs100_isWindows) {
      var id = stat.dev.toString(32) + ':' + stat.ino.toString(32);
      if (seenLinks.hasOwnProperty(id)) {
        return gotTarget(null, seenLinks[id], base);
      }
    }
    _fsrealpatholdjs100_fs.stat(base, function (err) {
      if (err) return cb(err);

      _fsrealpatholdjs100_fs.readlink(base, function (err, target) {
        if (!_fsrealpatholdjs100_isWindows) seenLinks[id] = target;
        gotTarget(err, target);
      });
    });
  }

  function gotTarget(err, target, base) {
    if (err) return cb(err);

    var resolvedLink = _fsrealpatholdjs100_pathModule.resolve(previous, target);
    if (cache) cache[base] = resolvedLink;
    gotResolvedLink(resolvedLink);
  }

  function gotResolvedLink(resolvedLink) {
    // resolve the link, then start over
    p = _fsrealpatholdjs100_pathModule.resolve(resolvedLink, p.slice(pos));
    start();
  }
};
/*≠≠ node_modules/fs.realpath/old.js ≠≠*/

/*== node_modules/fs.realpath/index.js ==*/
$m['fs.realpath/index.js#1.0.0'] = { exports: {} };
$m['fs.realpath/index.js#1.0.0'].exports = _fsrealpathindexjs100_realpath;
_fsrealpathindexjs100_realpath.realpath = _fsrealpathindexjs100_realpath;
_fsrealpathindexjs100_realpath.sync = _fsrealpathindexjs100_realpathSync;
_fsrealpathindexjs100_realpath.realpathSync = _fsrealpathindexjs100_realpathSync;
_fsrealpathindexjs100_realpath.monkeypatch = _fsrealpathindexjs100_monkeypatch;
_fsrealpathindexjs100_realpath.unmonkeypatch = _fsrealpathindexjs100_unmonkeypatch;

var _fsrealpathindexjs100_fs = require('fs');
var _fsrealpathindexjs100_origRealpath = _fsrealpathindexjs100_fs.realpath;
var _fsrealpathindexjs100_origRealpathSync = _fsrealpathindexjs100_fs.realpathSync;

var _fsrealpathindexjs100_version = process.version;
var _fsrealpathindexjs100_ok = /^v[0-5]\./.test(_fsrealpathindexjs100_version);
var _fsrealpathindexjs100_old = $m['fs.realpath/old.js#1.0.0'].exports;

function _fsrealpathindexjs100_newError(er) {
  return er && er.syscall === 'realpath' && (er.code === 'ELOOP' || er.code === 'ENOMEM' || er.code === 'ENAMETOOLONG');
}

function _fsrealpathindexjs100_realpath(p, cache, cb) {
  if (_fsrealpathindexjs100_ok) {
    return _fsrealpathindexjs100_origRealpath(p, cache, cb);
  }

  if (typeof cache === 'function') {
    cb = cache;
    cache = null;
  }
  _fsrealpathindexjs100_origRealpath(p, cache, function (er, result) {
    if (_fsrealpathindexjs100_newError(er)) {
      _fsrealpathindexjs100_old.realpath(p, cache, cb);
    } else {
      cb(er, result);
    }
  });
}

function _fsrealpathindexjs100_realpathSync(p, cache) {
  if (_fsrealpathindexjs100_ok) {
    return _fsrealpathindexjs100_origRealpathSync(p, cache);
  }

  try {
    return _fsrealpathindexjs100_origRealpathSync(p, cache);
  } catch (er) {
    if (_fsrealpathindexjs100_newError(er)) {
      return _fsrealpathindexjs100_old.realpathSync(p, cache);
    } else {
      throw er;
    }
  }
}

function _fsrealpathindexjs100_monkeypatch() {
  _fsrealpathindexjs100_fs.realpath = _fsrealpathindexjs100_realpath;
  _fsrealpathindexjs100_fs.realpathSync = _fsrealpathindexjs100_realpathSync;
}

function _fsrealpathindexjs100_unmonkeypatch() {
  _fsrealpathindexjs100_fs.realpath = _fsrealpathindexjs100_origRealpath;
  _fsrealpathindexjs100_fs.realpathSync = _fsrealpathindexjs100_origRealpathSync;
}
/*≠≠ node_modules/fs.realpath/index.js ≠≠*/

/*== node_modules/glob/sync.js ==*/
$m['glob/sync.js#7.1.0'] = function () {
$m['glob/sync.js#7.1.0'] = { exports: {} };
$m['glob/sync.js#7.1.0'].exports = _globsyncjs710_globSync;
_globsyncjs710_globSync.GlobSync = _globsyncjs710_GlobSync;

var _globsyncjs710_fs = require('fs');
var _globsyncjs710_rp = $m['fs.realpath/index.js#1.0.0'].exports;
var _globsyncjs710_minimatch = $m['minimatch/minimatch.js#3.0.2'].exports;
var _globsyncjs710_Minimatch = _globsyncjs710_minimatch.Minimatch;
var _globsyncjs710_Glob = $m['glob/glob.js#7.1.0'].exports.Glob;
var _globsyncjs710_util = require('util');
var _globsyncjs710_path = require('path');
var _globsyncjs710_assert = require('assert');
var _globsyncjs710_isAbsolute = $m['path-is-absolute/index.js#1.0.0'].exports;
var _globsyncjs710_common = $m['glob/common.js#7.1.0'].exports;
var _globsyncjs710_alphasort = _globsyncjs710_common.alphasort;
var _globsyncjs710_alphasorti = _globsyncjs710_common.alphasorti;
var _globsyncjs710_setopts = _globsyncjs710_common.setopts;
var _globsyncjs710_ownProp = _globsyncjs710_common.ownProp;
var _globsyncjs710_childrenIgnored = _globsyncjs710_common.childrenIgnored;
var _globsyncjs710_isIgnored = _globsyncjs710_common.isIgnored;

function _globsyncjs710_globSync(pattern, options) {
  if (typeof options === 'function' || arguments.length === 3) throw new TypeError('callback provided to sync glob\n' + 'See: https://github.com/isaacs/node-glob/issues/167');

  return new _globsyncjs710_GlobSync(pattern, options).found;
}

function _globsyncjs710_GlobSync(pattern, options) {
  if (!pattern) throw new Error('must provide pattern');

  if (typeof options === 'function' || arguments.length === 3) throw new TypeError('callback provided to sync glob\n' + 'See: https://github.com/isaacs/node-glob/issues/167');

  if (!(this instanceof _globsyncjs710_GlobSync)) return new _globsyncjs710_GlobSync(pattern, options);

  _globsyncjs710_setopts(this, pattern, options);

  if (this.noprocess) return this;

  var n = this.minimatch.set.length;
  this.matches = new Array(n);
  for (var i = 0; i < n; i++) {
    this._process(this.minimatch.set[i], i, false);
  }
  this._finish();
}

_globsyncjs710_GlobSync.prototype._finish = function () {
  _globsyncjs710_assert(this instanceof _globsyncjs710_GlobSync);
  if (this.realpath) {
    var self = this;
    this.matches.forEach(function (matchset, index) {
      var set = self.matches[index] = Object.create(null);
      for (var p in matchset) {
        try {
          p = self._makeAbs(p);
          var real = _globsyncjs710_rp.realpathSync(p, self.realpathCache);
          set[real] = true;
        } catch (er) {
          if (er.syscall === 'stat') set[self._makeAbs(p)] = true;else throw er;
        }
      }
    });
  }
  _globsyncjs710_common.finish(this);
};

_globsyncjs710_GlobSync.prototype._process = function (pattern, index, inGlobStar) {
  _globsyncjs710_assert(this instanceof _globsyncjs710_GlobSync);

  // Get the first [n] parts of pattern that are all strings.
  var n = 0;
  while (typeof pattern[n] === 'string') {
    n++;
  }
  // now n is the index of the first one that is *not* a string.

  // See if there's anything else
  var prefix;
  switch (n) {
    // if not, then this is rather simple
    case pattern.length:
      this._processSimple(pattern.join('/'), index);
      return;

    case 0:
      // pattern *starts* with some non-trivial item.
      // going to readdir(cwd), but not include the prefix in matches.
      prefix = null;
      break;

    default:
      // pattern has some string bits in the front.
      // whatever it starts with, whether that's 'absolute' like /foo/bar,
      // or 'relative' like '../baz'
      prefix = pattern.slice(0, n).join('/');
      break;
  }

  var remain = pattern.slice(n);

  // get the list of entries.
  var read;
  if (prefix === null) read = '.';else if (_globsyncjs710_isAbsolute(prefix) || _globsyncjs710_isAbsolute(pattern.join('/'))) {
    if (!prefix || !_globsyncjs710_isAbsolute(prefix)) prefix = '/' + prefix;
    read = prefix;
  } else read = prefix;

  var abs = this._makeAbs(read);

  //if ignored, skip processing
  if (_globsyncjs710_childrenIgnored(this, read)) return;

  var isGlobStar = remain[0] === _globsyncjs710_minimatch.GLOBSTAR;
  if (isGlobStar) this._processGlobStar(prefix, read, abs, remain, index, inGlobStar);else this._processReaddir(prefix, read, abs, remain, index, inGlobStar);
};

_globsyncjs710_GlobSync.prototype._processReaddir = function (prefix, read, abs, remain, index, inGlobStar) {
  var entries = this._readdir(abs, inGlobStar);

  // if the abs isn't a dir, then nothing can match!
  if (!entries) return;

  // It will only match dot entries if it starts with a dot, or if
  // dot is set.  Stuff like @(.foo|.bar) isn't allowed.
  var pn = remain[0];
  var negate = !!this.minimatch.negate;
  var rawGlob = pn._glob;
  var dotOk = this.dot || rawGlob.charAt(0) === '.';

  var matchedEntries = [];
  for (var i = 0; i < entries.length; i++) {
    var e = entries[i];
    if (e.charAt(0) !== '.' || dotOk) {
      var m;
      if (negate && !prefix) {
        m = !e.match(pn);
      } else {
        m = e.match(pn);
      }
      if (m) matchedEntries.push(e);
    }
  }

  var len = matchedEntries.length;
  // If there are no matched entries, then nothing matches.
  if (len === 0) return;

  // if this is the last remaining pattern bit, then no need for
  // an additional stat *unless* the user has specified mark or
  // stat explicitly.  We know they exist, since readdir returned
  // them.

  if (remain.length === 1 && !this.mark && !this.stat) {
    if (!this.matches[index]) this.matches[index] = Object.create(null);

    for (var i = 0; i < len; i++) {
      var e = matchedEntries[i];
      if (prefix) {
        if (prefix.slice(-1) !== '/') e = prefix + '/' + e;else e = prefix + e;
      }

      if (e.charAt(0) === '/' && !this.nomount) {
        e = _globsyncjs710_path.join(this.root, e);
      }
      this._emitMatch(index, e);
    }
    // This was the last one, and no stats were needed
    return;
  }

  // now test all matched entries as stand-ins for that part
  // of the pattern.
  remain.shift();
  for (var i = 0; i < len; i++) {
    var e = matchedEntries[i];
    var newPattern;
    if (prefix) newPattern = [prefix, e];else newPattern = [e];
    this._process(newPattern.concat(remain), index, inGlobStar);
  }
};

_globsyncjs710_GlobSync.prototype._emitMatch = function (index, e) {
  if (_globsyncjs710_isIgnored(this, e)) return;

  var abs = this._makeAbs(e);

  if (this.mark) e = this._mark(e);

  if (this.absolute) {
    e = abs;
  }

  if (this.matches[index][e]) return;

  if (this.nodir) {
    var c = this.cache[abs];
    if (c === 'DIR' || Array.isArray(c)) return;
  }

  this.matches[index][e] = true;

  if (this.stat) this._stat(e);
};

_globsyncjs710_GlobSync.prototype._readdirInGlobStar = function (abs) {
  // follow all symlinked directories forever
  // just proceed as if this is a non-globstar situation
  if (this.follow) return this._readdir(abs, false);

  var entries;
  var lstat;
  var stat;
  try {
    lstat = _globsyncjs710_fs.lstatSync(abs);
  } catch (er) {
    // lstat failed, doesn't exist
    return null;
  }

  var isSym = lstat.isSymbolicLink();
  this.symlinks[abs] = isSym;

  // If it's not a symlink or a dir, then it's definitely a regular file.
  // don't bother doing a readdir in that case.
  if (!isSym && !lstat.isDirectory()) this.cache[abs] = 'FILE';else entries = this._readdir(abs, false);

  return entries;
};

_globsyncjs710_GlobSync.prototype._readdir = function (abs, inGlobStar) {
  var entries;

  if (inGlobStar && !_globsyncjs710_ownProp(this.symlinks, abs)) return this._readdirInGlobStar(abs);

  if (_globsyncjs710_ownProp(this.cache, abs)) {
    var c = this.cache[abs];
    if (!c || c === 'FILE') return null;

    if (Array.isArray(c)) return c;
  }

  try {
    return this._readdirEntries(abs, _globsyncjs710_fs.readdirSync(abs));
  } catch (er) {
    this._readdirError(abs, er);
    return null;
  }
};

_globsyncjs710_GlobSync.prototype._readdirEntries = function (abs, entries) {
  // if we haven't asked to stat everything, then just
  // assume that everything in there exists, so we can avoid
  // having to stat it a second time.
  if (!this.mark && !this.stat) {
    for (var i = 0; i < entries.length; i++) {
      var e = entries[i];
      if (abs === '/') e = abs + e;else e = abs + '/' + e;
      this.cache[e] = true;
    }
  }

  this.cache[abs] = entries;

  // mark and cache dir-ness
  return entries;
};

_globsyncjs710_GlobSync.prototype._readdirError = function (f, er) {
  // handle errors, and cache the information
  switch (er.code) {
    case 'ENOTSUP': // https://github.com/isaacs/node-glob/issues/205
    case 'ENOTDIR':
      // totally normal. means it *does* exist.
      var abs = this._makeAbs(f);
      this.cache[abs] = 'FILE';
      if (abs === this.cwdAbs) {
        var error = new Error(er.code + ' invalid cwd ' + this.cwd);
        error.path = this.cwd;
        error.code = er.code;
        throw error;
      }
      break;

    case 'ENOENT': // not terribly unusual
    case 'ELOOP':
    case 'ENAMETOOLONG':
    case 'UNKNOWN':
      this.cache[this._makeAbs(f)] = false;
      break;

    default:
      // some unusual error.  Treat as failure.
      this.cache[this._makeAbs(f)] = false;
      if (this.strict) throw er;
      if (!this.silent) console.error('glob error', er);
      break;
  }
};

_globsyncjs710_GlobSync.prototype._processGlobStar = function (prefix, read, abs, remain, index, inGlobStar) {

  var entries = this._readdir(abs, inGlobStar);

  // no entries means not a dir, so it can never have matches
  // foo.txt/** doesn't match foo.txt
  if (!entries) return;

  // test without the globstar, and with every child both below
  // and replacing the globstar.
  var remainWithoutGlobStar = remain.slice(1);
  var gspref = prefix ? [prefix] : [];
  var noGlobStar = gspref.concat(remainWithoutGlobStar);

  // the noGlobStar pattern exits the inGlobStar state
  this._process(noGlobStar, index, false);

  var len = entries.length;
  var isSym = this.symlinks[abs];

  // If it's a symlink, and we're in a globstar, then stop
  if (isSym && inGlobStar) return;

  for (var i = 0; i < len; i++) {
    var e = entries[i];
    if (e.charAt(0) === '.' && !this.dot) continue;

    // these two cases enter the inGlobStar state
    var instead = gspref.concat(entries[i], remainWithoutGlobStar);
    this._process(instead, index, true);

    var below = gspref.concat(entries[i], remain);
    this._process(below, index, true);
  }
};

_globsyncjs710_GlobSync.prototype._processSimple = function (prefix, index) {
  // XXX review this.  Shouldn't it be doing the mounting etc
  // before doing stat?  kinda weird?
  var exists = this._stat(prefix);

  if (!this.matches[index]) this.matches[index] = Object.create(null);

  // If it doesn't exist, then just mark the lack of results
  if (!exists) return;

  if (prefix && _globsyncjs710_isAbsolute(prefix) && !this.nomount) {
    var trail = /[\/\\]$/.test(prefix);
    if (prefix.charAt(0) === '/') {
      prefix = _globsyncjs710_path.join(this.root, prefix);
    } else {
      prefix = _globsyncjs710_path.resolve(this.root, prefix);
      if (trail) prefix += '/';
    }
  }

  if (process.platform === 'win32') prefix = prefix.replace(/\\/g, '/');

  // Mark this as a match
  this._emitMatch(index, prefix);
};

// Returns either 'DIR', 'FILE', or false
_globsyncjs710_GlobSync.prototype._stat = function (f) {
  var abs = this._makeAbs(f);
  var needDir = f.slice(-1) === '/';

  if (f.length > this.maxLength) return false;

  if (!this.stat && _globsyncjs710_ownProp(this.cache, abs)) {
    var c = this.cache[abs];

    if (Array.isArray(c)) c = 'DIR';

    // It exists, but maybe not how we need it
    if (!needDir || c === 'DIR') return c;

    if (needDir && c === 'FILE') return false;

    // otherwise we have to stat, because maybe c=true
    // if we know it exists, but not what it is.
  }

  var exists;
  var stat = this.statCache[abs];
  if (!stat) {
    var lstat;
    try {
      lstat = _globsyncjs710_fs.lstatSync(abs);
    } catch (er) {
      return false;
    }

    if (lstat.isSymbolicLink()) {
      try {
        stat = _globsyncjs710_fs.statSync(abs);
      } catch (er) {
        stat = lstat;
      }
    } else {
      stat = lstat;
    }
  }

  this.statCache[abs] = stat;

  var c = stat.isDirectory() ? 'DIR' : 'FILE';
  this.cache[abs] = this.cache[abs] || c;

  if (needDir && c !== 'DIR') return false;

  return c;
};

_globsyncjs710_GlobSync.prototype._mark = function (p) {
  return _globsyncjs710_common.mark(this, p);
};

_globsyncjs710_GlobSync.prototype._makeAbs = function (f) {
  return _globsyncjs710_common.makeAbs(this, f);
};
};
/*≠≠ node_modules/glob/sync.js ≠≠*/

/*== node_modules/inherits/inherits_browser.js ==*/
$m['inherits/inherits_browser.js#2.0.3'] = { exports: {} };
if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  $m['inherits/inherits_browser.js#2.0.3'].exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor;
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  };
} else {
  // old school shim for old browsers
  $m['inherits/inherits_browser.js#2.0.3'].exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor;
    var TempCtor = function () {};
    TempCtor.prototype = superCtor.prototype;
    ctor.prototype = new TempCtor();
    ctor.prototype.constructor = ctor;
  };
}
/*≠≠ node_modules/inherits/inherits_browser.js ≠≠*/

/*== node_modules/glob/glob.js ==*/
$m['glob/glob.js#7.1.0'] = { exports: {} };
// Approach:
//
// 1. Get the minimatch set
// 2. For each pattern in the set, PROCESS(pattern, false)
// 3. Store matches per-set, then uniq them
//
// PROCESS(pattern, inGlobStar)
// Get the first [n] items from pattern that are all strings
// Join these together.  This is PREFIX.
//   If there is no more remaining, then stat(PREFIX) and
//   add to matches if it succeeds.  END.
//
// If inGlobStar and PREFIX is symlink and points to dir
//   set ENTRIES = []
// else readdir(PREFIX) as ENTRIES
//   If fail, END
//
// with ENTRIES
//   If pattern[n] is GLOBSTAR
//     // handle the case where the globstar match is empty
//     // by pruning it out, and testing the resulting pattern
//     PROCESS(pattern[0..n] + pattern[n+1 .. $], false)
//     // handle other cases.
//     for ENTRY in ENTRIES (not dotfiles)
//       // attach globstar + tail onto the entry
//       // Mark that this entry is a globstar match
//       PROCESS(pattern[0..n] + ENTRY + pattern[n .. $], true)
//
//   else // not globstar
//     for ENTRY in ENTRIES (not dotfiles, unless pattern[n] is dot)
//       Test ENTRY against pattern[n]
//       If fails, continue
//       If passes, PROCESS(pattern[0..n] + item + pattern[n+1 .. $])
//
// Caveat:
//   Cache all stats and readdirs results to minimize syscall.  Since all
//   we ever care about is existence and directory-ness, we can just keep
//   `true` for files, and [children,...] for directories, or `false` for
//   things that don't exist.

$m['glob/glob.js#7.1.0'].exports = _globglobjs710_glob;

var _globglobjs710_fs = require('fs');
var _globglobjs710_rp = $m['fs.realpath/index.js#1.0.0'].exports;
var _globglobjs710_minimatch = $m['minimatch/minimatch.js#3.0.2'].exports;
var _globglobjs710_Minimatch = _globglobjs710_minimatch.Minimatch;
var _globglobjs710_inherits = $m['inherits/inherits_browser.js#2.0.3'].exports;
var _globglobjs710_EE = require('events').EventEmitter;
var _globglobjs710_path = require('path');
var _globglobjs710_assert = require('assert');
var _globglobjs710_isAbsolute = $m['path-is-absolute/index.js#1.0.0'].exports;
var _globglobjs710_globSync = require('glob/sync.js#7.1.0');
var _globglobjs710_common = $m['glob/common.js#7.1.0'].exports;
var _globglobjs710_alphasort = _globglobjs710_common.alphasort;
var _globglobjs710_alphasorti = _globglobjs710_common.alphasorti;
var _globglobjs710_setopts = _globglobjs710_common.setopts;
var _globglobjs710_ownProp = _globglobjs710_common.ownProp;
var _globglobjs710_inflight = $m['inflight/inflight.js#1.0.5'].exports;
var _globglobjs710_util = require('util');
var _globglobjs710_childrenIgnored = _globglobjs710_common.childrenIgnored;
var _globglobjs710_isIgnored = _globglobjs710_common.isIgnored;

var _globglobjs710_once = $m['once/once.js#1.4.0'].exports;

function _globglobjs710_glob(pattern, options, cb) {
  if (typeof options === 'function') cb = options, options = {};
  if (!options) options = {};

  if (options.sync) {
    if (cb) throw new TypeError('callback provided to sync glob');
    return _globglobjs710_globSync(pattern, options);
  }

  return new _globglobjs710_Glob(pattern, options, cb);
}

_globglobjs710_glob.sync = _globglobjs710_globSync;
var _globglobjs710_GlobSync = _globglobjs710_glob.GlobSync = _globglobjs710_globSync.GlobSync;

// old api surface
_globglobjs710_glob.glob = _globglobjs710_glob;

function _globglobjs710_extend(origin, add) {
  if (add === null || typeof add !== 'object') {
    return origin;
  }

  var keys = Object.keys(add);
  var i = keys.length;
  while (i--) {
    origin[keys[i]] = add[keys[i]];
  }
  return origin;
}

_globglobjs710_glob.hasMagic = function (pattern, options_) {
  var options = _globglobjs710_extend({}, options_);
  options.noprocess = true;

  var g = new _globglobjs710_Glob(pattern, options);
  var set = g.minimatch.set;

  if (!pattern) return false;

  if (set.length > 1) return true;

  for (var j = 0; j < set[0].length; j++) {
    if (typeof set[0][j] !== 'string') return true;
  }

  return false;
};

_globglobjs710_glob.Glob = _globglobjs710_Glob;
_globglobjs710_inherits(_globglobjs710_Glob, _globglobjs710_EE);
function _globglobjs710_Glob(pattern, options, cb) {
  if (typeof options === 'function') {
    cb = options;
    options = null;
  }

  if (options && options.sync) {
    if (cb) throw new TypeError('callback provided to sync glob');
    return new _globglobjs710_GlobSync(pattern, options);
  }

  if (!(this instanceof _globglobjs710_Glob)) return new _globglobjs710_Glob(pattern, options, cb);

  _globglobjs710_setopts(this, pattern, options);
  this._didRealPath = false;

  // process each pattern in the minimatch set
  var n = this.minimatch.set.length;

  // The matches are stored as {<filename>: true,...} so that
  // duplicates are automagically pruned.
  // Later, we do an Object.keys() on these.
  // Keep them as a list so we can fill in when nonull is set.
  this.matches = new Array(n);

  if (typeof cb === 'function') {
    cb = _globglobjs710_once(cb);
    this.on('error', cb);
    this.on('end', function (matches) {
      cb(null, matches);
    });
  }

  var self = this;
  var n = this.minimatch.set.length;
  this._processing = 0;
  this.matches = new Array(n);

  this._emitQueue = [];
  this._processQueue = [];
  this.paused = false;

  if (this.noprocess) return this;

  if (n === 0) return done();

  var sync = true;
  for (var i = 0; i < n; i++) {
    this._process(this.minimatch.set[i], i, false, done);
  }
  sync = false;

  function done() {
    --self._processing;
    if (self._processing <= 0) {
      if (sync) {
        process.nextTick(function () {
          self._finish();
        });
      } else {
        self._finish();
      }
    }
  }
}

_globglobjs710_Glob.prototype._finish = function () {
  _globglobjs710_assert(this instanceof _globglobjs710_Glob);
  if (this.aborted) return;

  if (this.realpath && !this._didRealpath) return this._realpath();

  _globglobjs710_common.finish(this);
  this.emit('end', this.found);
};

_globglobjs710_Glob.prototype._realpath = function () {
  if (this._didRealpath) return;

  this._didRealpath = true;

  var n = this.matches.length;
  if (n === 0) return this._finish();

  var self = this;
  for (var i = 0; i < this.matches.length; i++) this._realpathSet(i, next);

  function next() {
    if (--n === 0) self._finish();
  }
};

_globglobjs710_Glob.prototype._realpathSet = function (index, cb) {
  var matchset = this.matches[index];
  if (!matchset) return cb();

  var found = Object.keys(matchset);
  var self = this;
  var n = found.length;

  if (n === 0) return cb();

  var set = this.matches[index] = Object.create(null);
  found.forEach(function (p, i) {
    // If there's a problem with the stat, then it means that
    // one or more of the links in the realpath couldn't be
    // resolved.  just return the abs value in that case.
    p = self._makeAbs(p);
    _globglobjs710_rp.realpath(p, self.realpathCache, function (er, real) {
      if (!er) set[real] = true;else if (er.syscall === 'stat') set[p] = true;else self.emit('error', er); // srsly wtf right here

      if (--n === 0) {
        self.matches[index] = set;
        cb();
      }
    });
  });
};

_globglobjs710_Glob.prototype._mark = function (p) {
  return _globglobjs710_common.mark(this, p);
};

_globglobjs710_Glob.prototype._makeAbs = function (f) {
  return _globglobjs710_common.makeAbs(this, f);
};

_globglobjs710_Glob.prototype.abort = function () {
  this.aborted = true;
  this.emit('abort');
};

_globglobjs710_Glob.prototype.pause = function () {
  if (!this.paused) {
    this.paused = true;
    this.emit('pause');
  }
};

_globglobjs710_Glob.prototype.resume = function () {
  if (this.paused) {
    this.emit('resume');
    this.paused = false;
    if (this._emitQueue.length) {
      var eq = this._emitQueue.slice(0);
      this._emitQueue.length = 0;
      for (var i = 0; i < eq.length; i++) {
        var e = eq[i];
        this._emitMatch(e[0], e[1]);
      }
    }
    if (this._processQueue.length) {
      var pq = this._processQueue.slice(0);
      this._processQueue.length = 0;
      for (var i = 0; i < pq.length; i++) {
        var p = pq[i];
        this._processing--;
        this._process(p[0], p[1], p[2], p[3]);
      }
    }
  }
};

_globglobjs710_Glob.prototype._process = function (pattern, index, inGlobStar, cb) {
  _globglobjs710_assert(this instanceof _globglobjs710_Glob);
  _globglobjs710_assert(typeof cb === 'function');

  if (this.aborted) return;

  this._processing++;
  if (this.paused) {
    this._processQueue.push([pattern, index, inGlobStar, cb]);
    return;
  }

  //console.error('PROCESS %d', this._processing, pattern)

  // Get the first [n] parts of pattern that are all strings.
  var n = 0;
  while (typeof pattern[n] === 'string') {
    n++;
  }
  // now n is the index of the first one that is *not* a string.

  // see if there's anything else
  var prefix;
  switch (n) {
    // if not, then this is rather simple
    case pattern.length:
      this._processSimple(pattern.join('/'), index, cb);
      return;

    case 0:
      // pattern *starts* with some non-trivial item.
      // going to readdir(cwd), but not include the prefix in matches.
      prefix = null;
      break;

    default:
      // pattern has some string bits in the front.
      // whatever it starts with, whether that's 'absolute' like /foo/bar,
      // or 'relative' like '../baz'
      prefix = pattern.slice(0, n).join('/');
      break;
  }

  var remain = pattern.slice(n);

  // get the list of entries.
  var read;
  if (prefix === null) read = '.';else if (_globglobjs710_isAbsolute(prefix) || _globglobjs710_isAbsolute(pattern.join('/'))) {
    if (!prefix || !_globglobjs710_isAbsolute(prefix)) prefix = '/' + prefix;
    read = prefix;
  } else read = prefix;

  var abs = this._makeAbs(read);

  //if ignored, skip _processing
  if (_globglobjs710_childrenIgnored(this, read)) return cb();

  var isGlobStar = remain[0] === _globglobjs710_minimatch.GLOBSTAR;
  if (isGlobStar) this._processGlobStar(prefix, read, abs, remain, index, inGlobStar, cb);else this._processReaddir(prefix, read, abs, remain, index, inGlobStar, cb);
};

_globglobjs710_Glob.prototype._processReaddir = function (prefix, read, abs, remain, index, inGlobStar, cb) {
  var self = this;
  this._readdir(abs, inGlobStar, function (er, entries) {
    return self._processReaddir2(prefix, read, abs, remain, index, inGlobStar, entries, cb);
  });
};

_globglobjs710_Glob.prototype._processReaddir2 = function (prefix, read, abs, remain, index, inGlobStar, entries, cb) {

  // if the abs isn't a dir, then nothing can match!
  if (!entries) return cb();

  // It will only match dot entries if it starts with a dot, or if
  // dot is set.  Stuff like @(.foo|.bar) isn't allowed.
  var pn = remain[0];
  var negate = !!this.minimatch.negate;
  var rawGlob = pn._glob;
  var dotOk = this.dot || rawGlob.charAt(0) === '.';

  var matchedEntries = [];
  for (var i = 0; i < entries.length; i++) {
    var e = entries[i];
    if (e.charAt(0) !== '.' || dotOk) {
      var m;
      if (negate && !prefix) {
        m = !e.match(pn);
      } else {
        m = e.match(pn);
      }
      if (m) matchedEntries.push(e);
    }
  }

  //console.error('prd2', prefix, entries, remain[0]._glob, matchedEntries)

  var len = matchedEntries.length;
  // If there are no matched entries, then nothing matches.
  if (len === 0) return cb();

  // if this is the last remaining pattern bit, then no need for
  // an additional stat *unless* the user has specified mark or
  // stat explicitly.  We know they exist, since readdir returned
  // them.

  if (remain.length === 1 && !this.mark && !this.stat) {
    if (!this.matches[index]) this.matches[index] = Object.create(null);

    for (var i = 0; i < len; i++) {
      var e = matchedEntries[i];
      if (prefix) {
        if (prefix !== '/') e = prefix + '/' + e;else e = prefix + e;
      }

      if (e.charAt(0) === '/' && !this.nomount) {
        e = _globglobjs710_path.join(this.root, e);
      }
      this._emitMatch(index, e);
    }
    // This was the last one, and no stats were needed
    return cb();
  }

  // now test all matched entries as stand-ins for that part
  // of the pattern.
  remain.shift();
  for (var i = 0; i < len; i++) {
    var e = matchedEntries[i];
    var newPattern;
    if (prefix) {
      if (prefix !== '/') e = prefix + '/' + e;else e = prefix + e;
    }
    this._process([e].concat(remain), index, inGlobStar, cb);
  }
  cb();
};

_globglobjs710_Glob.prototype._emitMatch = function (index, e) {
  if (this.aborted) return;

  if (_globglobjs710_isIgnored(this, e)) return;

  if (this.paused) {
    this._emitQueue.push([index, e]);
    return;
  }

  var abs = this._makeAbs(e);

  if (this.mark) e = this._mark(e);

  if (this.absolute) e = abs;

  if (this.matches[index][e]) return;

  if (this.nodir) {
    var c = this.cache[abs];
    if (c === 'DIR' || Array.isArray(c)) return;
  }

  this.matches[index][e] = true;

  var st = this.statCache[abs];
  if (st) this.emit('stat', e, st);

  this.emit('match', e);
};

_globglobjs710_Glob.prototype._readdirInGlobStar = function (abs, cb) {
  if (this.aborted) return;

  // follow all symlinked directories forever
  // just proceed as if this is a non-globstar situation
  if (this.follow) return this._readdir(abs, false, cb);

  var lstatkey = 'lstat\0' + abs;
  var self = this;
  var lstatcb = _globglobjs710_inflight(lstatkey, lstatcb_);

  if (lstatcb) _globglobjs710_fs.lstat(abs, lstatcb);

  function lstatcb_(er, lstat) {
    if (er) return cb();

    var isSym = lstat.isSymbolicLink();
    self.symlinks[abs] = isSym;

    // If it's not a symlink or a dir, then it's definitely a regular file.
    // don't bother doing a readdir in that case.
    if (!isSym && !lstat.isDirectory()) {
      self.cache[abs] = 'FILE';
      cb();
    } else self._readdir(abs, false, cb);
  }
};

_globglobjs710_Glob.prototype._readdir = function (abs, inGlobStar, cb) {
  if (this.aborted) return;

  cb = _globglobjs710_inflight('readdir\0' + abs + '\0' + inGlobStar, cb);
  if (!cb) return;

  //console.error('RD %j %j', +inGlobStar, abs)
  if (inGlobStar && !_globglobjs710_ownProp(this.symlinks, abs)) return this._readdirInGlobStar(abs, cb);

  if (_globglobjs710_ownProp(this.cache, abs)) {
    var c = this.cache[abs];
    if (!c || c === 'FILE') return cb();

    if (Array.isArray(c)) return cb(null, c);
  }

  var self = this;
  _globglobjs710_fs.readdir(abs, _globglobjs710_readdirCb(this, abs, cb));
};

function _globglobjs710_readdirCb(self, abs, cb) {
  return function (er, entries) {
    if (er) self._readdirError(abs, er, cb);else self._readdirEntries(abs, entries, cb);
  };
}

_globglobjs710_Glob.prototype._readdirEntries = function (abs, entries, cb) {
  if (this.aborted) return;

  // if we haven't asked to stat everything, then just
  // assume that everything in there exists, so we can avoid
  // having to stat it a second time.
  if (!this.mark && !this.stat) {
    for (var i = 0; i < entries.length; i++) {
      var e = entries[i];
      if (abs === '/') e = abs + e;else e = abs + '/' + e;
      this.cache[e] = true;
    }
  }

  this.cache[abs] = entries;
  return cb(null, entries);
};

_globglobjs710_Glob.prototype._readdirError = function (f, er, cb) {
  if (this.aborted) return;

  // handle errors, and cache the information
  switch (er.code) {
    case 'ENOTSUP': // https://github.com/isaacs/node-glob/issues/205
    case 'ENOTDIR':
      // totally normal. means it *does* exist.
      var abs = this._makeAbs(f);
      this.cache[abs] = 'FILE';
      if (abs === this.cwdAbs) {
        var error = new Error(er.code + ' invalid cwd ' + this.cwd);
        error.path = this.cwd;
        error.code = er.code;
        this.emit('error', error);
        this.abort();
      }
      break;

    case 'ENOENT': // not terribly unusual
    case 'ELOOP':
    case 'ENAMETOOLONG':
    case 'UNKNOWN':
      this.cache[this._makeAbs(f)] = false;
      break;

    default:
      // some unusual error.  Treat as failure.
      this.cache[this._makeAbs(f)] = false;
      if (this.strict) {
        this.emit('error', er);
        // If the error is handled, then we abort
        // if not, we threw out of here
        this.abort();
      }
      if (!this.silent) console.error('glob error', er);
      break;
  }

  return cb();
};

_globglobjs710_Glob.prototype._processGlobStar = function (prefix, read, abs, remain, index, inGlobStar, cb) {
  var self = this;
  this._readdir(abs, inGlobStar, function (er, entries) {
    self._processGlobStar2(prefix, read, abs, remain, index, inGlobStar, entries, cb);
  });
};

_globglobjs710_Glob.prototype._processGlobStar2 = function (prefix, read, abs, remain, index, inGlobStar, entries, cb) {
  //console.error('pgs2', prefix, remain[0], entries)

  // no entries means not a dir, so it can never have matches
  // foo.txt/** doesn't match foo.txt
  if (!entries) return cb();

  // test without the globstar, and with every child both below
  // and replacing the globstar.
  var remainWithoutGlobStar = remain.slice(1);
  var gspref = prefix ? [prefix] : [];
  var noGlobStar = gspref.concat(remainWithoutGlobStar);

  // the noGlobStar pattern exits the inGlobStar state
  this._process(noGlobStar, index, false, cb);

  var isSym = this.symlinks[abs];
  var len = entries.length;

  // If it's a symlink, and we're in a globstar, then stop
  if (isSym && inGlobStar) return cb();

  for (var i = 0; i < len; i++) {
    var e = entries[i];
    if (e.charAt(0) === '.' && !this.dot) continue;

    // these two cases enter the inGlobStar state
    var instead = gspref.concat(entries[i], remainWithoutGlobStar);
    this._process(instead, index, true, cb);

    var below = gspref.concat(entries[i], remain);
    this._process(below, index, true, cb);
  }

  cb();
};

_globglobjs710_Glob.prototype._processSimple = function (prefix, index, cb) {
  // XXX review this.  Shouldn't it be doing the mounting etc
  // before doing stat?  kinda weird?
  var self = this;
  this._stat(prefix, function (er, exists) {
    self._processSimple2(prefix, index, er, exists, cb);
  });
};
_globglobjs710_Glob.prototype._processSimple2 = function (prefix, index, er, exists, cb) {

  //console.error('ps2', prefix, exists)

  if (!this.matches[index]) this.matches[index] = Object.create(null);

  // If it doesn't exist, then just mark the lack of results
  if (!exists) return cb();

  if (prefix && _globglobjs710_isAbsolute(prefix) && !this.nomount) {
    var trail = /[\/\\]$/.test(prefix);
    if (prefix.charAt(0) === '/') {
      prefix = _globglobjs710_path.join(this.root, prefix);
    } else {
      prefix = _globglobjs710_path.resolve(this.root, prefix);
      if (trail) prefix += '/';
    }
  }

  if (process.platform === 'win32') prefix = prefix.replace(/\\/g, '/');

  // Mark this as a match
  this._emitMatch(index, prefix);
  cb();
};

// Returns either 'DIR', 'FILE', or false
_globglobjs710_Glob.prototype._stat = function (f, cb) {
  var abs = this._makeAbs(f);
  var needDir = f.slice(-1) === '/';

  if (f.length > this.maxLength) return cb();

  if (!this.stat && _globglobjs710_ownProp(this.cache, abs)) {
    var c = this.cache[abs];

    if (Array.isArray(c)) c = 'DIR';

    // It exists, but maybe not how we need it
    if (!needDir || c === 'DIR') return cb(null, c);

    if (needDir && c === 'FILE') return cb();

    // otherwise we have to stat, because maybe c=true
    // if we know it exists, but not what it is.
  }

  var exists;
  var stat = this.statCache[abs];
  if (stat !== undefined) {
    if (stat === false) return cb(null, stat);else {
      var type = stat.isDirectory() ? 'DIR' : 'FILE';
      if (needDir && type === 'FILE') return cb();else return cb(null, type, stat);
    }
  }

  var self = this;
  var statcb = _globglobjs710_inflight('stat\0' + abs, lstatcb_);
  if (statcb) _globglobjs710_fs.lstat(abs, statcb);

  function lstatcb_(er, lstat) {
    if (lstat && lstat.isSymbolicLink()) {
      // If it's a symlink, then treat it as the target, unless
      // the target does not exist, then treat it as a file.
      return _globglobjs710_fs.stat(abs, function (er, stat) {
        if (er) self._stat2(f, abs, null, lstat, cb);else self._stat2(f, abs, er, stat, cb);
      });
    } else {
      self._stat2(f, abs, er, lstat, cb);
    }
  }
};

_globglobjs710_Glob.prototype._stat2 = function (f, abs, er, stat, cb) {
  if (er) {
    this.statCache[abs] = false;
    return cb();
  }

  var needDir = f.slice(-1) === '/';
  this.statCache[abs] = stat;

  if (abs.slice(-1) === '/' && !stat.isDirectory()) return cb(null, false, stat);

  var c = stat.isDirectory() ? 'DIR' : 'FILE';
  this.cache[abs] = this.cache[abs] || c;

  if (needDir && c !== 'DIR') return cb();

  return cb(null, c, stat);
};
/*≠≠ node_modules/glob/glob.js ≠≠*/

/*== node_modules/rimraf/rimraf.js ==*/
$m['rimraf/rimraf.js#2.5.2'] = { exports: {} };
$m['rimraf/rimraf.js#2.5.2'].exports = _rimrafrimrafjs252_rimraf;
_rimrafrimrafjs252_rimraf.sync = _rimrafrimrafjs252_rimrafSync;

var _rimrafrimrafjs252_assert = require("assert");
var _rimrafrimrafjs252_path = require("path");
var _rimrafrimrafjs252_fs = require("fs");
var _rimrafrimrafjs252_glob = $m['glob/glob.js#7.1.0'].exports;

var _rimrafrimrafjs252_defaultGlobOpts = {
  nosort: true,
  silent: true
};

// for EMFILE handling
var _rimrafrimrafjs252_timeout = 0;

var _rimrafrimrafjs252_isWindows = process.platform === "win32";

function _rimrafrimrafjs252_defaults(options) {
  var methods = ['unlink', 'chmod', 'stat', 'lstat', 'rmdir', 'readdir'];
  methods.forEach(function (m) {
    options[m] = options[m] || _rimrafrimrafjs252_fs[m];
    m = m + 'Sync';
    options[m] = options[m] || _rimrafrimrafjs252_fs[m];
  });

  options.maxBusyTries = options.maxBusyTries || 3;
  options.emfileWait = options.emfileWait || 1000;
  if (options.glob === false) {
    options.disableGlob = true;
  }
  options.disableGlob = options.disableGlob || false;
  options.glob = options.glob || _rimrafrimrafjs252_defaultGlobOpts;
}

function _rimrafrimrafjs252_rimraf(p, options, cb) {
  if (typeof options === 'function') {
    cb = options;
    options = {};
  }

  _rimrafrimrafjs252_assert(p, 'rimraf: missing path');
  _rimrafrimrafjs252_assert.equal(typeof p, 'string', 'rimraf: path should be a string');
  _rimrafrimrafjs252_assert(options, 'rimraf: missing options');
  _rimrafrimrafjs252_assert.equal(typeof options, 'object', 'rimraf: options should be object');
  _rimrafrimrafjs252_assert.equal(typeof cb, 'function', 'rimraf: callback function required');

  _rimrafrimrafjs252_defaults(options);

  var busyTries = 0;
  var errState = null;
  var n = 0;

  if (options.disableGlob || !_rimrafrimrafjs252_glob.hasMagic(p)) return afterGlob(null, [p]);

  _rimrafrimrafjs252_fs.lstat(p, function (er, stat) {
    if (!er) return afterGlob(null, [p]);

    _rimrafrimrafjs252_glob(p, options.glob, afterGlob);
  });

  function next(er) {
    errState = errState || er;
    if (--n === 0) cb(errState);
  }

  function afterGlob(er, results) {
    if (er) return cb(er);

    n = results.length;
    if (n === 0) return cb();

    results.forEach(function (p) {
      _rimrafrimrafjs252_rimraf_(p, options, function CB(er) {
        if (er) {
          if (_rimrafrimrafjs252_isWindows && (er.code === "EBUSY" || er.code === "ENOTEMPTY" || er.code === "EPERM") && busyTries < options.maxBusyTries) {
            busyTries++;
            var time = busyTries * 100;
            // try again, with the same exact callback as this one.
            return setTimeout(function () {
              _rimrafrimrafjs252_rimraf_(p, options, CB);
            }, time);
          }

          // this one won't happen if graceful-fs is used.
          if (er.code === "EMFILE" && _rimrafrimrafjs252_timeout < options.emfileWait) {
            return setTimeout(function () {
              _rimrafrimrafjs252_rimraf_(p, options, CB);
            }, _rimrafrimrafjs252_timeout++);
          }

          // already gone
          if (er.code === "ENOENT") er = null;
        }

        _rimrafrimrafjs252_timeout = 0;
        next(er);
      });
    });
  }
}

// Two possible strategies.
// 1. Assume it's a file.  unlink it, then do the dir stuff on EPERM or EISDIR
// 2. Assume it's a directory.  readdir, then do the file stuff on ENOTDIR
//
// Both result in an extra syscall when you guess wrong.  However, there
// are likely far more normal files in the world than directories.  This
// is based on the assumption that a the average number of files per
// directory is >= 1.
//
// If anyone ever complains about this, then I guess the strategy could
// be made configurable somehow.  But until then, YAGNI.
function _rimrafrimrafjs252_rimraf_(p, options, cb) {
  _rimrafrimrafjs252_assert(p);
  _rimrafrimrafjs252_assert(options);
  _rimrafrimrafjs252_assert(typeof cb === 'function');

  // sunos lets the root user unlink directories, which is... weird.
  // so we have to lstat here and make sure it's not a dir.
  options.lstat(p, function (er, st) {
    if (er && er.code === "ENOENT") return cb(null);

    if (st && st.isDirectory()) return _rimrafrimrafjs252_rmdir(p, options, er, cb);

    options.unlink(p, function (er) {
      if (er) {
        if (er.code === "ENOENT") return cb(null);
        if (er.code === "EPERM") return _rimrafrimrafjs252_isWindows ? _rimrafrimrafjs252_fixWinEPERM(p, options, er, cb) : _rimrafrimrafjs252_rmdir(p, options, er, cb);
        if (er.code === "EISDIR") return _rimrafrimrafjs252_rmdir(p, options, er, cb);
      }
      return cb(er);
    });
  });
}

function _rimrafrimrafjs252_fixWinEPERM(p, options, er, cb) {
  _rimrafrimrafjs252_assert(p);
  _rimrafrimrafjs252_assert(options);
  _rimrafrimrafjs252_assert(typeof cb === 'function');
  if (er) _rimrafrimrafjs252_assert(er instanceof Error);

  options.chmod(p, 666, function (er2) {
    if (er2) cb(er2.code === "ENOENT" ? null : er);else options.stat(p, function (er3, stats) {
      if (er3) cb(er3.code === "ENOENT" ? null : er);else if (stats.isDirectory()) _rimrafrimrafjs252_rmdir(p, options, er, cb);else options.unlink(p, cb);
    });
  });
}

function _rimrafrimrafjs252_fixWinEPERMSync(p, options, er) {
  _rimrafrimrafjs252_assert(p);
  _rimrafrimrafjs252_assert(options);
  if (er) _rimrafrimrafjs252_assert(er instanceof Error);

  try {
    options.chmodSync(p, 666);
  } catch (er2) {
    if (er2.code === "ENOENT") return;else throw er;
  }

  try {
    var stats = options.statSync(p);
  } catch (er3) {
    if (er3.code === "ENOENT") return;else throw er;
  }

  if (stats.isDirectory()) _rimrafrimrafjs252_rmdirSync(p, options, er);else options.unlinkSync(p);
}

function _rimrafrimrafjs252_rmdir(p, options, originalEr, cb) {
  _rimrafrimrafjs252_assert(p);
  _rimrafrimrafjs252_assert(options);
  if (originalEr) _rimrafrimrafjs252_assert(originalEr instanceof Error);
  _rimrafrimrafjs252_assert(typeof cb === 'function');

  // try to rmdir first, and only readdir on ENOTEMPTY or EEXIST (SunOS)
  // if we guessed wrong, and it's not a directory, then
  // raise the original error.
  options.rmdir(p, function (er) {
    if (er && (er.code === "ENOTEMPTY" || er.code === "EEXIST" || er.code === "EPERM")) _rimrafrimrafjs252_rmkids(p, options, cb);else if (er && er.code === "ENOTDIR") cb(originalEr);else cb(er);
  });
}

function _rimrafrimrafjs252_rmkids(p, options, cb) {
  _rimrafrimrafjs252_assert(p);
  _rimrafrimrafjs252_assert(options);
  _rimrafrimrafjs252_assert(typeof cb === 'function');

  options.readdir(p, function (er, files) {
    if (er) return cb(er);
    var n = files.length;
    if (n === 0) return options.rmdir(p, cb);
    var errState;
    files.forEach(function (f) {
      _rimrafrimrafjs252_rimraf(_rimrafrimrafjs252_path.join(p, f), options, function (er) {
        if (errState) return;
        if (er) return cb(errState = er);
        if (--n === 0) options.rmdir(p, cb);
      });
    });
  });
}

// this looks simpler, and is strictly *faster*, but will
// tie up the JavaScript thread and fail on excessively
// deep directory trees.
function _rimrafrimrafjs252_rimrafSync(p, options) {
  options = options || {};
  _rimrafrimrafjs252_defaults(options);

  _rimrafrimrafjs252_assert(p, 'rimraf: missing path');
  _rimrafrimrafjs252_assert.equal(typeof p, 'string', 'rimraf: path should be a string');
  _rimrafrimrafjs252_assert(options, 'rimraf: missing options');
  _rimrafrimrafjs252_assert.equal(typeof options, 'object', 'rimraf: options should be object');

  var results;

  if (options.disableGlob || !_rimrafrimrafjs252_glob.hasMagic(p)) {
    results = [p];
  } else {
    try {
      _rimrafrimrafjs252_fs.lstatSync(p);
      results = [p];
    } catch (er) {
      results = _rimrafrimrafjs252_glob.sync(p, options.glob);
    }
  }

  if (!results.length) return;

  for (var i = 0; i < results.length; i++) {
    var p = results[i];

    try {
      var st = options.lstatSync(p);
    } catch (er) {
      if (er.code === "ENOENT") return;
    }

    try {
      // sunos lets the root user unlink directories, which is... weird.
      if (st && st.isDirectory()) _rimrafrimrafjs252_rmdirSync(p, options, null);else options.unlinkSync(p);
    } catch (er) {
      if (er.code === "ENOENT") return;
      if (er.code === "EPERM") return _rimrafrimrafjs252_isWindows ? _rimrafrimrafjs252_fixWinEPERMSync(p, options, er) : _rimrafrimrafjs252_rmdirSync(p, options, er);
      if (er.code !== "EISDIR") throw er;
      _rimrafrimrafjs252_rmdirSync(p, options, er);
    }
  }
}

function _rimrafrimrafjs252_rmdirSync(p, options, originalEr) {
  _rimrafrimrafjs252_assert(p);
  _rimrafrimrafjs252_assert(options);
  if (originalEr) _rimrafrimrafjs252_assert(originalEr instanceof Error);

  try {
    options.rmdirSync(p);
  } catch (er) {
    if (er.code === "ENOENT") return;
    if (er.code === "ENOTDIR") throw originalEr;
    if (er.code === "ENOTEMPTY" || er.code === "EEXIST" || er.code === "EPERM") _rimrafrimrafjs252_rmkidsSync(p, options);
  }
}

function _rimrafrimrafjs252_rmkidsSync(p, options) {
  _rimrafrimrafjs252_assert(p);
  _rimrafrimrafjs252_assert(options);
  options.readdirSync(p).forEach(function (f) {
    _rimrafrimrafjs252_rimrafSync(_rimrafrimrafjs252_path.join(p, f), options);
  });
  options.rmdirSync(p, options);
}
/*≠≠ node_modules/rimraf/rimraf.js ≠≠*/

/*== node_modules/recur-fs/lib/rm.js ==*/
$m['recur-fs/lib/rm.js#2.2.3'] = { exports: {} };
var _recurfslibrmjs223_fs = require('fs'),
    _recurfslibrmjs223_rimraf = $m['rimraf/rimraf.js#2.5.2'].exports;

/**
 * Recursive remove file or directory
 * Makes sure only project sources are removed
 * @param {String} source
 * @param {Function} fn(err)
 */
$m['recur-fs/lib/rm.js#2.2.3'].exports = function rm(source, fn) {
	if (_recurfslibrmjs223_fs.existsSync(source)) {
		if (~source.indexOf(process.cwd())) {
			_recurfslibrmjs223_rimraf(source, function (err) {
				if (err) return fn(err);else return fn();
			});
		} else {
			fn(new Error('cannot rm source outside of project path: ' + source));
		}
	} else {
		fn(new Error('cannot rm non-existant source: ' + source));
	}
};

/**
 * Synchronously recursive remove file or directory
 * Makes sure only project sources are removed
 * @param {String} source
 */
$m['recur-fs/lib/rm.js#2.2.3'].exports.sync = function rmSync(source) {
	if (_recurfslibrmjs223_fs.existsSync(source)) {
		if (~source.indexOf(process.cwd())) {
			_recurfslibrmjs223_rimraf.sync(source);
		} else {
			throw new Error('cannot rm source outside of project path: ' + source);
		}
	} else {
		throw new Error('cannot rm non-existant source: ' + source);
	}
};
/*≠≠ node_modules/recur-fs/lib/rm.js ≠≠*/

/*== node_modules/recur-fs/lib/readdir.js ==*/
$m['recur-fs/lib/readdir.js#2.2.3'] = { exports: {} };
var _recurfslibreaddirjs223_fs = require('fs'),
    _recurfslibreaddirjs223_path = require('path');

/**
 * Read the contents of 'directory', returning all resources.
 * 'visitor' is optional function called on each resource,
 * and resource is skipped if next() returns "false"
 * @param {String} dir
 * @param {Function} [visitor(resource, stat, next)]
 * @param {Function} fn(err, resources)
 */
$m['recur-fs/lib/readdir.js#2.2.3'].exports = function readdir(directory, visitor, fn) {
	if (arguments.length == 2) {
		fn = visitor;
		// Noop
		visitor = function (resource, stat, next) {
			next();
		};
	}

	var resources = [],
	    outstanding = 0,
	    done = function () {
		if (! --outstanding) fn(null, resources);
	};

	function visit(dir) {
		outstanding++;

		_recurfslibreaddirjs223_fs.readdir(dir, function (err, files) {
			if (err) {
				// Skip if not found, otherwise exit
				if (err.code === 'ENOENT') return done();
				return fn(err);
			}

			// Include dir
			outstanding += files.length - 1;

			files.forEach(function (file) {
				file = _recurfslibreaddirjs223_path.join(dir, file);
				_recurfslibreaddirjs223_fs.stat(file, function (err, stat) {
					if (err) {
						// Skip if not found, otherwise exit
						if (err.code === 'ENOENT') return done();
						return fn(err);
					}

					visitor(file, stat, function next(include) {
						// Store
						if (include !== false) resources.push(file);
						// Recurse child directory
						if (stat.isDirectory()) visit(file);
						done();
					});
				});
			});
		});
	}

	visit(directory);
};

/**
 * Synchronously read the contents of 'directory', returning all resources.
 * 'visitor' is optional function called on each resource,
 * and resource is skipped if visitor returns "false"
 * @param {String} dir
 * @param {Function} [visitor(resource, stat)]
 * @returns {Array}
 */
$m['recur-fs/lib/readdir.js#2.2.3'].exports.sync = function readdirSync(directory, visitor) {
	visitor = visitor || function (resource, stat, next) {};

	var resources = [];

	function visit(dir) {
		if (_recurfslibreaddirjs223_fs.existsSync(dir)) {
			_recurfslibreaddirjs223_fs.readdirSync(dir).forEach(function (file) {
				file = _recurfslibreaddirjs223_path.resolve(dir, file);
				try {
					var stat = _recurfslibreaddirjs223_fs.statSync(file);
				} catch (err) {
					// Skip if file not found, otherwise throw
					if (err.code === 'ENOENT') {
						return;
					} else {
						throw err;
					}
				}

				// Store
				var include = visitor(file, stat);
				if (include !== false) resources.push(file);

				// Recurse child directory
				if (stat.isDirectory()) visit(file);
			});
		}
	}

	visit(directory);

	return resources;
};
/*≠≠ node_modules/recur-fs/lib/readdir.js ≠≠*/

/*== node_modules/mkdirp/index.js ==*/
$m['mkdirp/index.js#0.5.1'] = { exports: {} };
var _mkdirpindexjs051_path = require('path');
var _mkdirpindexjs051_fs = require('fs');
var _mkdirpindexjs051__0777 = parseInt('0777', 8);

$m['mkdirp/index.js#0.5.1'].exports = _mkdirpindexjs051_mkdirP.mkdirp = _mkdirpindexjs051_mkdirP.mkdirP = _mkdirpindexjs051_mkdirP;

function _mkdirpindexjs051_mkdirP(p, opts, f, made) {
    if (typeof opts === 'function') {
        f = opts;
        opts = {};
    } else if (!opts || typeof opts !== 'object') {
        opts = { mode: opts };
    }

    var mode = opts.mode;
    var xfs = opts.fs || _mkdirpindexjs051_fs;

    if (mode === undefined) {
        mode = _mkdirpindexjs051__0777 & ~process.umask();
    }
    if (!made) made = null;

    var cb = f || function () {};
    p = _mkdirpindexjs051_path.resolve(p);

    xfs.mkdir(p, mode, function (er) {
        if (!er) {
            made = made || p;
            return cb(null, made);
        }
        switch (er.code) {
            case 'ENOENT':
                _mkdirpindexjs051_mkdirP(_mkdirpindexjs051_path.dirname(p), opts, function (er, made) {
                    if (er) cb(er, made);else _mkdirpindexjs051_mkdirP(p, opts, cb, made);
                });
                break;

            // In the case of any other error, just see if there's a dir
            // there already.  If so, then hooray!  If not, then something
            // is borked.
            default:
                xfs.stat(p, function (er2, stat) {
                    // if the stat fails, then that's super weird.
                    // let the original error be the failure reason.
                    if (er2 || !stat.isDirectory()) cb(er, made);else cb(null, made);
                });
                break;
        }
    });
}

_mkdirpindexjs051_mkdirP.sync = function sync(p, opts, made) {
    if (!opts || typeof opts !== 'object') {
        opts = { mode: opts };
    }

    var mode = opts.mode;
    var xfs = opts.fs || _mkdirpindexjs051_fs;

    if (mode === undefined) {
        mode = _mkdirpindexjs051__0777 & ~process.umask();
    }
    if (!made) made = null;

    p = _mkdirpindexjs051_path.resolve(p);

    try {
        xfs.mkdirSync(p, mode);
        made = made || p;
    } catch (err0) {
        switch (err0.code) {
            case 'ENOENT':
                made = sync(_mkdirpindexjs051_path.dirname(p), opts, made);
                sync(p, opts, made);
                break;

            // In the case of any other error, just see if there's a dir
            // there already.  If so, then hooray!  If not, then something
            // is borked.
            default:
                var stat;
                try {
                    stat = xfs.statSync(p);
                } catch (err1) {
                    throw err0;
                }
                if (!stat.isDirectory()) throw err0;
                break;
        }
    }

    return made;
};
/*≠≠ node_modules/mkdirp/index.js ≠≠*/

/*== node_modules/recur-fs/lib/mkdir.js ==*/
$m['recur-fs/lib/mkdir.js#2.2.3'] = { exports: {} };
var _recurfslibmkdirjs223_fs = require('fs'),
    _recurfslibmkdirjs223_mkdirp = $m['mkdirp/index.js#0.5.1'].exports,
    _recurfslibmkdirjs223_path = require('path');

/**
 * Recursively create 'directory'
 * @param {String} directory
 * @param {Function} fn(err)
 */
$m['recur-fs/lib/mkdir.js#2.2.3'].exports = function mkdir(directory, fn) {
	// Resolve directory name if passed a file
	directory = _recurfslibmkdirjs223_path.extname(directory) ? _recurfslibmkdirjs223_path.dirname(directory) : directory;

	if (!_recurfslibmkdirjs223_fs.existsSync(directory)) {
		_recurfslibmkdirjs223_mkdirp(directory, function (err) {
			if (err) return fn(err);
			return fn();
		});
	} else {
		return fn();
	}
};

/**
 * Synchronously create 'directory'
 * @param {String} directory
 */
$m['recur-fs/lib/mkdir.js#2.2.3'].exports.sync = function mkdirSync(directory) {
	// Resolve directory name if passed a file
	directory = _recurfslibmkdirjs223_path.extname(directory) ? _recurfslibmkdirjs223_path.dirname(directory) : directory;

	if (!_recurfslibmkdirjs223_fs.existsSync(directory)) {
		_recurfslibmkdirjs223_mkdirp.sync(directory);
	}
};
/*≠≠ node_modules/recur-fs/lib/mkdir.js ≠≠*/

/*== node_modules/recur-fs/lib/mv.js ==*/
$m['recur-fs/lib/mv.js#2.2.3'] = { exports: {} };
var _recurfslibmvjs223_fs = require('fs'),
    _recurfslibmvjs223_mkdir = $m['recur-fs/lib/mkdir.js#2.2.3'].exports,
    _recurfslibmvjs223_path = require('path'),
    _recurfslibmvjs223_rm = $m['recur-fs/lib/rm.js#2.2.3'].exports;

/**
 * Move file or directory 'source' to 'destination'
 * @param {String} source
 * @param {String} destination
 * @param {Boolean} force
 * @param {Function} fn(err, filepath)
 */
$m['recur-fs/lib/mv.js#2.2.3'].exports = function mv(source, destination, force, fn) {
	if (force == null) force = false;

	_recurfslibmvjs223_mkdir(destination, function (err) {
		if (err) {
			return fn(err);
		} else {
			var filepath = _recurfslibmvjs223_path.resolve(destination, _recurfslibmvjs223_path.basename(source));

			if (!force && _recurfslibmvjs223_fs.existsSync(filepath)) {
				return fn(null, filepath);
			} else {
				_recurfslibmvjs223_rm(filepath, function (err) {
					// Ignore rm errors
					_recurfslibmvjs223_fs.rename(source, filepath, function (err) {
						if (err) return fn(err);
						return fn(null, filepath);
					});
				});
			}
		}
	});
};

/**
 * Synchronously move file or directory 'source' to 'destination'
 * @param {String} source
 * @param {String} destination
 * @param {Boolean} force
 * @returns {String}
 */
$m['recur-fs/lib/mv.js#2.2.3'].exports.sync = function mvSync(source, destination, force) {
	if (force == null) force = false;

	if (!_recurfslibmvjs223_fs.existsSync(destination)) _recurfslibmvjs223_mkdir.sync(destination);

	var filepath = _recurfslibmvjs223_path.resolve(destination, _recurfslibmvjs223_path.basename(source));

	if (_recurfslibmvjs223_fs.existsSync(filepath)) {
		if (!force) return filepath;
		_recurfslibmvjs223_rm.sync(filepath);
	}
	_recurfslibmvjs223_fs.renameSync(source, filepath);

	return filepath;
};
/*≠≠ node_modules/recur-fs/lib/mv.js ≠≠*/

/*== node_modules/recur-fs/lib/indir.js ==*/
$m['recur-fs/lib/indir.js#2.2.3'] = { exports: {} };
var _recurfslibindirjs223_path = require('path');

/**
 * Check that a 'filepath' is likely a child of a given directory
 * Applies to nested directories
 * Only makes String comparison. Does not check for existance
 * @param {String} directory
 * @param {String} filepath
 * @returns {Boolean}
 */
$m['recur-fs/lib/indir.js#2.2.3'].exports = function indir(directory, filepath) {
	if (directory && filepath) {
		directory = _recurfslibindirjs223_path.resolve(directory);
		filepath = _recurfslibindirjs223_path.resolve(filepath);

		if (~filepath.indexOf(directory)) {
			return !~_recurfslibindirjs223_path.relative(directory, filepath).indexOf('..');
		}
	}

	return false;
};
/*≠≠ node_modules/recur-fs/lib/indir.js ≠≠*/

/*== node_modules/recur-fs/lib/cp.js ==*/
$m['recur-fs/lib/cp.js#2.2.3'] = { exports: {} };
var _recurfslibcpjs223_fs = require('fs'),
    _recurfslibcpjs223_mkdir = $m['recur-fs/lib/mkdir.js#2.2.3'].exports,
    _recurfslibcpjs223_path = require('path'),
    _recurfslibcpjs223_rm = $m['recur-fs/lib/rm.js#2.2.3'].exports;

/**
 * Copy file or directory 'source' to 'destination'
 * Copies contents of 'source' if directory and ends in trailing '/'
 * @param {String} source
 * @param {String} destination
 * @param {Boolean} force
 * @param {Function} fn(err, filepath)
 */
$m['recur-fs/lib/cp.js#2.2.3'].exports = function cp(source, destination, force, fn) {
	var filepath = '',
	    first = true,
	    outstanding = 0;

	if (force == null) force = false;

	function copy(source, destination) {
		outstanding++;
		_recurfslibcpjs223_fs.stat(source, function (err, stat) {
			var isDestFile;
			outstanding--;
			// Exit if proper error, otherwise skip
			if (err) {
				if (err.code === 'ENOENT') return;
				return fn(err);
			} else {
				isDestFile = _recurfslibcpjs223_path.extname(destination).length;
				// File
				if (stat.isFile()) {
					// Handle file or directory as destination
					var destDir = isDestFile ? _recurfslibcpjs223_path.dirname(destination) : destination,
					    destName = isDestFile ? _recurfslibcpjs223_path.basename(destination) : _recurfslibcpjs223_path.basename(source),
					    filepath = _recurfslibcpjs223_path.resolve(destDir, destName);
					// Write file if it doesn't already exist
					if (!force && _recurfslibcpjs223_fs.existsSync(filepath)) {
						if (!outstanding) return fn(null, filepath);
					} else {
						_recurfslibcpjs223_rm(filepath, function (err) {
							// Ignore rm errors
							var file;
							outstanding++;
							// Return the new path for the first source
							if (first) {
								filepath = filepath;
								first = false;
							}
							// Pipe stream
							_recurfslibcpjs223_fs.createReadStream(source).pipe(file = _recurfslibcpjs223_fs.createWriteStream(filepath));
							file.on('error', function (err) {
								return fn(err);
							});
							file.on('close', function () {
								outstanding--;
								// Return if no outstanding
								if (!outstanding) return fn(null, filepath);
							});
						});
					}
					// Directory
				} else {
					// Guard against invalid directory to file copy
					if (isDestFile) {
						fn(new Error('invalid destination for copy: ' + destination));
					} else {
						// Copy contents only if source ends in '/'
						var contentsOnly = first && /\\$|\/$/.test(source),
						    dest = contentsOnly ? destination : _recurfslibcpjs223_path.resolve(destination, _recurfslibcpjs223_path.basename(source));

						// Create in destination
						outstanding++;
						_recurfslibcpjs223_mkdir(dest, function (err) {
							outstanding--;
							if (err) {
								return fn(err);
							} else {
								// Loop through contents
								outstanding++;
								_recurfslibcpjs223_fs.readdir(source, function (err, files) {
									outstanding--;
									// Exit if proper error, otherwise skip
									if (err) {
										if (err.code === 'ENOENT') return;else return fn(err);
									} else {
										// Return the new path for the first source
										if (first) {
											filepath = dest;
											first = false;
										}
										// Loop through files and cp
										files.forEach(function (file) {
											copy(_recurfslibcpjs223_path.resolve(source, file), dest);
										});
										// Return if no outstanding
										if (!outstanding) return fn(null, filepath);
									}
								});
							}
						});
					}
				}
			}
		});
		// Return if no outstanding
		if (!outstanding) return fn(null, filepath);
	};

	return copy(source, destination);
};

/**
 * Synchronously copy file or directory 'source' to 'destination'
 * Copies contents of 'source' if directory and ends in trailing '/'
 * @param {String} source
 * @param {String} destination
 * @param {Boolean} force
 * @returns {String}
 */
$m['recur-fs/lib/cp.js#2.2.3'].exports.sync = function cpSync(source, destination, force) {
	var filepath = '',
	    first = true;

	if (force == null) force = false;

	function copy(source, destination) {
		if (_recurfslibcpjs223_fs.existsSync(source)) {
			var stat = _recurfslibcpjs223_fs.statSync(source),
			    isDestFile = _recurfslibcpjs223_path.extname(destination).length;

			// File
			if (stat.isFile()) {
				// Handle file or directory as destination
				var destDir = isDestFile ? _recurfslibcpjs223_path.dirname(destination) : destination,
				    destName = isDestFile ? _recurfslibcpjs223_path.basename(destination) : _recurfslibcpjs223_path.basename(source),
				    filepath = _recurfslibcpjs223_path.resolve(destDir, destName);

				// Return the new path for the first source
				if (first) {
					filepath = filepath;
					first = false;
				}
				// Write file only if it doesn't already exist
				if (_recurfslibcpjs223_fs.existsSync(filepath)) {
					if (!force) return filepath;
					_recurfslibcpjs223_rm.sync(filepath);
				}
				_recurfslibcpjs223_fs.writeFileSync(filepath, _recurfslibcpjs223_fs.readFileSync(source));

				// Directory
			} else {
				// Guard against invalid directory to file copy
				if (isDestFile) throw new Error('invalid destination for copy: ' + destination);
				// Copy contents only if source ends in '/'
				var contentsOnly = first && /\\$|\/$/.test(source),
				    dest = contentsOnly ? destination : _recurfslibcpjs223_path.resolve(destination, _recurfslibcpjs223_path.basename(source));

				// Return the new path for the first source
				if (first) {
					filepath = dest;
					first = false;
				}
				// Create in destination
				_recurfslibcpjs223_mkdir.sync(dest);
				// Loop through files and copy
				var files = _recurfslibcpjs223_fs.readdirSync(source);
				files.forEach(function (file) {
					copy(_recurfslibcpjs223_path.resolve(source, file), dest);
				});
			}
		}
		return filepath;
	};

	return copy(source, destination);
};
/*≠≠ node_modules/recur-fs/lib/cp.js ≠≠*/

/*== node_modules/recur-fs/index.js ==*/
$m['recur-fs/index.js#2.2.3'] = { exports: {} };
$m['recur-fs/index.js#2.2.3'].exports.cp = $m['recur-fs/lib/cp.js#2.2.3'].exports;
$m['recur-fs/index.js#2.2.3'].exports.indir = $m['recur-fs/lib/indir.js#2.2.3'].exports;
$m['recur-fs/index.js#2.2.3'].exports.mkdir = $m['recur-fs/lib/mkdir.js#2.2.3'].exports;
$m['recur-fs/index.js#2.2.3'].exports.mv = $m['recur-fs/lib/mv.js#2.2.3'].exports;
$m['recur-fs/index.js#2.2.3'].exports.readdir = $m['recur-fs/lib/readdir.js#2.2.3'].exports;
$m['recur-fs/index.js#2.2.3'].exports.rm = $m['recur-fs/lib/rm.js#2.2.3'].exports;
$m['recur-fs/index.js#2.2.3'].exports.walk = $m['recur-fs/lib/walk.js#2.2.3'].exports;
$m['recur-fs/index.js#2.2.3'].exports.hunt = $m['recur-fs/lib/hunt.js#2.2.3'].exports;
/*≠≠ node_modules/recur-fs/index.js ≠≠*/

/*== lib/find.js ==*/
$m['lib/find.js'] = { exports: {} };
'use strict';

const _libfindjs_fs = require('fs');
const _libfindjs_path = require('path');
const { walk: _libfindjs_walk } = $m['recur-fs/index.js#2.2.3'].exports;

/**
 * Walk directory tree from cwd to find nearest buddy dir
 * @param {Boolean} useCli
 * @param {Function} fn(err, buddyFactory, version)
 */
$m['lib/find.js'].exports = function find(useCli, fn) {
  function load(buddy) {
    try {
      const buddyFactory = require(buddy);
      const version = require(_libfindjs_path.join(buddy, 'package.json')).version;

      fn(null, buddyFactory, version);
    } catch (err) {
      if (err.message == 'missing path') {
        fn(Error(useCli ? 'a local version of buddy wasn\'t found on this path' : 'buddy not found'));
      } else {
        fn(err);
      }
    }
  }

  // Loaded via buddy-cli
  if (useCli) {
    let stop = false;
    let buddy;

    _libfindjs_walk(process.cwd(), (resource, stat, next) => {
      if (stat.isDirectory()) {
        if (_libfindjs_path.basename(resource) == 'buddy') {
          buddy = resource;
          stop = true;
        } else if (_libfindjs_path.basename(resource) == 'node_modules') {
          resource = _libfindjs_path.join(resource, 'buddy');
          if (_libfindjs_fs.existsSync(resource)) {
            buddy = resource;
            stop = true;
          }
        }
      }
      next(stop);
    }, err => {
      if (err) return fn(err);
      load(buddy);
    });

    // Loaded as buddy dependency
  } else {
    // main is buddy/bin/buddy
    load(_libfindjs_path.join(_libfindjs_path.dirname(require.main.filename), '..'));
  }
};
/*≠≠ lib/find.js ≠≠*/

/*== lib/index.js ==*/
$m['lib/index.js'] = { exports: {} };
'use strict';

const _libindexjs_find = $m['lib/find.js'].exports;
const _libindexjs_program = $m['commander/index.js#2.9.0'].exports;

const _libindexjs_useCli = ~require.main.filename.indexOf('buddy-cli');
let _libindexjs_buddy;

// Register for uncaught errors and clean up
process.on('uncaughtException', err => {
  console.log(err.stack ? err.stack : err);
  // Ding!
  console.log('\x07');
  if (_libindexjs_buddy) _libindexjs_buddy.exceptionalCleanup();
  process.exit(1);
});

_libindexjs_find(_libindexjs_useCli, (err, buddyFactory, version) => {
  if (err) throw err;

  _libindexjs_buddy = buddyFactory();

  _libindexjs_program.version(version).usage('[options] <command> [configpath]').option('-c, --compress', 'compress output for production deployment').option('-g, --grep <pattern>', 'only run build targets matching <pattern>').option('-i, --invert', 'inverts grep matches').option('--input', 'input file/directory for simple config-free build').option('--output', 'output file/directory for simple config-free build').option('-r, --reload', 'reload all connected live-reload clients on file change during watch [ADD-ON buddy-server]').option('-s, --serve', 'create a webserver to serve static files during watch [ADD-ON buddy-server]').option('-S, --script', 'run script on build completion').option('-v, --verbose', 'print all messages for debugging');

  _libindexjs_program.command('build [configpath]').description('build js, css, html, and image sources').action(configpath => {
    buddyFactory(_libindexjs_parseConfig(configpath), _libindexjs_getOptions()).build();
  });

  _libindexjs_program.command('watch [configpath]').description('watch js, css, html, and image source files and build changes').action(configpath => {
    let options = _libindexjs_getOptions();

    options.watch = true;
    buddyFactory(_libindexjs_parseConfig(configpath), options).watch();
  });

  _libindexjs_program.command('deploy [configpath]').description('build compressed js, css, html, and image sources').action(configpath => {
    let options = _libindexjs_getOptions();

    options.deploy = options.compress = true;
    buddyFactory(_libindexjs_parseConfig(configpath), options).build();
  });

  _libindexjs_program.parse(process.argv);

  // Show help if no arguments or no command
  if (!_libindexjs_program.args.length || !_libindexjs_program.args.filter(arg => 'string' != typeof arg).length) {
    _libindexjs_program.help();
  }
});

/**
 * Parse config
 * @param {String} configpath
 * @returns {Object}
 */
function _libindexjs_parseConfig(configpath) {
  if (_libindexjs_program.input) {
    configpath = {
      input: _libindexjs_program.input,
      output: _libindexjs_program.output || '.'
    };
  }

  return configpath;
}

/**
 * Retrieve options object
 * @returns {Object}
 */
function _libindexjs_getOptions() {
  return {
    compress: _libindexjs_program.compress,
    deploy: false,
    grep: _libindexjs_program.grep,
    invert: _libindexjs_program.invert,
    reload: _libindexjs_program.reload,
    // Backwards compat
    script: _libindexjs_program.script || _libindexjs_program.test,
    serve: _libindexjs_program.serve,
    watch: false,
    verbose: _libindexjs_program.verbose
  };
}
/*≠≠ lib/index.js ≠≠*/