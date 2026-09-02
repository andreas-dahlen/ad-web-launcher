// import { run } from './run/run.ts'
import { compilerConfigSchema } from './configSchema.ts'
import { build } from './runtime/build.ts'
import { run } from './runtime/run.ts'

console.log('TOKEN COMPILER INITIALIZED')

const [command, rootDir, configJson] = process.argv.slice(2)

const options = configJson
  ? compilerConfigSchema.parse(JSON.parse(configJson))
  : {}

switch (command) {
  case 'exe': {

    void run(rootDir, options)
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