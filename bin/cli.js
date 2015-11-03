#!/usr/bin/env node

var _ = require('underscore');
var campto = require('../lib');

if (_.keys(campto.camptoConfig).length === 0) {
  console.error('\x1b[31m%s\x1b[0m',
    'Can not find campto config file from `' + process.cwd() + '/campto[.js|.json]`.');
  process.exit(1);
}
if (!campto.camptoConfig['preBuild']) {
  console.error('\x1b[31m%s\x1b[0m',
    'Please set preBuild to true in your config file.');
  process.exit(1);
}

var program = require('commander');
var monitor = new campto.Monitor(campto.camptoConfig);

program
  .version(require('../package').version, null)
  .action(function (command) {
    try {
      monitor[command]();
    } catch (e) {
      console.error('\x1b[31m%s\x1b[0m',
        'Command `' + command + ' does not support.');
    }
  });

program.parse(process.argv);
