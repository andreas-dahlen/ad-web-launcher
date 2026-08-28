// import { run } from './run/run.js'
import { compilerConfigSchema } from './configSchema.js'
import { build } from './run/build.js'
import { run } from './run/run.js'

console.log('TOKEN COMPILER INITIALIZED')

const [command, rootDir, configJson] = process.argv.slice(2)

const options = configJson
  ? compilerConfigSchema.parse(JSON.parse(configJson))
  : {}

switch (command) {
  case 'exe': {

    run(rootDir, options)
    break
  }

  case 'build':
    build(rootDir, options)
    break

  default:
    console.log('Options:')
    console.log('  run <rootDir>                Use specified root directory')
    console.log('  run <rootDir> <configJson>   Use optional JSON configuration options')
}