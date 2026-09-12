import path from 'node:path'
import { compiler } from './entries/entry.ts'

const [command, rootDir, tokenFolder] = process.argv.slice(2)

const cliDirectory = path.dirname(process.argv[1])
const compilerDirectory = path.dirname(cliDirectory)
const projectRoot = path.resolve(
  compilerDirectory,
  rootDir,
)

switch (command) {
  case 'watch': {
    console.log('TOKEN COMPILER INITIALIZED')
    compiler.runWatch(projectRoot, tokenFolder)
    break
  }

  case 'build': {
    compiler.runBuild(projectRoot)
    break
  }

  case 'css': {
    compiler.runCss(projectRoot)
    break
  }

  default:
    console.log('Options:')
    console.log('  watch <rootDir>                Use specified root directory')
    console.log('  watch <rootDir> <tokenFolder>   Use optional tokenFolder')
}