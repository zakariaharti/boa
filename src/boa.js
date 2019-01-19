'use strict'

const readPkg = require('read-pkg');
const loudRejection = require('loud-rejection');
const decamelizeKeys = require('decamelize-keys');
const buildOptions = require('minimist-options');
const yargs = require('yargs-parser');
const camelcaseKeys = require('camelcase-keys');
const redent = require('redent');
const trimNewlines = require('trim-newlines');
const normalizeData = require('normalize-package-data');

const boa = options => {
  options = Object.assign({},options,{
    packageFile: readPkg.readSync({
      cwd: path.dirname(module.parent.filename),
      normalize: false
    }),
    argv: process.argv.slice(2),
    input: 'string',
    helpText: '',
    autoHelp: true,
    autoVersion: true,
    booleanDefault: false,
    handlePromiseRejection: true
  });

  if(options.handlePromiseRejection){
    loudRejection();
  }

  const minimistFlags = options.flags && typeof options.booleanDefault !== 'undefined'
    ? Object.keys(options.flags).reduce((flags,flag) => {
      if(flags[flag].type == 'boolean' && !Object.prototype.hasOwnProperty.call(flags[flag] ,'default')){
        flags[flag].default == options.booleanDefault;
      }

      return flags;
    }, options.flags)
    : options.flags;

  let minimistoptions = {
  	 arguments: options.input,
  	 ...minimistFlags
  };

  const { packageFile } = options;
  minimistoptions = decamelizeKeys(minimistoptions, '-', {exclude: ['stopEarly', '--']});
  minimistoptions = buildOptions(minimistoptions);

  const argv = yargs(options.argv, minimistoptions);
  let helpText = redent(trimNewlines((options.helpText || '').replace(/\t+\n*$/, '')), 2);

  normalizeData(packageFile);

  process.title = packageFile.bin ? Object.keys(packageFile.bin)[0] : packageFile.name;

  let {description} = options;
	if (!description && description !== false) {
		({description} = packageFile);
	}

	helpText = (description ? `\n  ${description}\n` : '') + (helpText ? `\n${helpText}\n` : '\n');

  const showHelp = code => {
		console.log(helpText);
		process.exit(typeof code === 'number' ? code : 2);
	};

	const showVersion = () => {
		console.log(typeof options.version === 'string' ? options.version : packageFile.version);
		process.exit();
	};

	if (argv.version && options.autoVersion) {
		showVersion();
	}

	if (argv.help && options.autoHelp) {
		showHelp(0);
	}

  const input = argv._;
	delete argv._;

	const flags = camelcaseKeys(argv, {exclude: ['--', /^\w$/]});

  return {
		input,
		flags,
		packageFile,
		helpText,
		showHelp,
		showVersion
  };
};

module.exports = boa;
