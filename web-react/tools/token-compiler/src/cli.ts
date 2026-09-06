// import { run } from './run/run.ts'
import { build } from './runtime/build.ts'
import { run } from './runtime/run.ts'

console.log('TOKEN COMPILER INITIALIZED')

const [command, rootDir, tokenFolder] = process.argv.slice(2)

switch (command) {
  case 'exe': {

    void run(rootDir, tokenFolder)
    break
  }

  case 'build':
    build(rootDir, tokenFolder)
    break

  default:
    console.log('Options:')
    console.log('  run <rootDir>                Use specified root directory')
    console.log('  run <rootDir> <tokenFolder>   Use optional tokenFolder')
}