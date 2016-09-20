#!/usr/bin/env node

const campto = require('../lib')

if (Object.keys(campto.camptoConfig).length === 0) {
  console.error('\x1b[31m%s\x1b[0m',
    `Can not find campto config file from '#{process.cwd()}/campto[.js|.json]'.`)
  process.exit(1)
}
if (!campto.camptoConfig['preBuild']) {
  console.error('\x1b[31m%s\x1b[0m',
    'WARN::Please set preBuild to true in your config file.')
  process.exit(1)
}

const program = require('commander')
const monitor = new campto.Monitor(campto.camptoConfig)

program
  .version(require('../package').version, null)
  .action(function (command) {
    try {
      monitor[command]()
    } catch (e) {
      console.error('\x1b[31m%s\x1b[0m',
        'Command `' + command + ` does not support.\n${e}`)
    }
  })

program.parse(process.argv)
