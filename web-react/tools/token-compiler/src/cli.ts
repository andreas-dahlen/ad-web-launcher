import { run } from './run/run.js'

console.log('STYLE TOKEN COMPILER')

const [command, configJson] = process.argv.slice(2)

switch (command) {
  case 'run':
    const config = configJson
      ? JSON.parse(configJson)
      : {}
    run(config)
    break

  default:
    console.log('Options:')
    console.log('  run             Use defaults')
    console.log('  run <rootDir>   Use specified root directory')
}