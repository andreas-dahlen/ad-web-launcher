#!/usr/bin/env node

import path from 'node:path'
import { compiler } from './entries/entry.ts'

const [command, rootDir] = process.argv.slice(2)

const cliDirectory = path.dirname(process.argv[1])
const compilerDirectory = path.dirname(cliDirectory)
const projectRoot = path.resolve(
  compilerDirectory,
  rootDir,
)

switch (command) {
  case 'watch': {
    console.log('CASCADE COMPILER INITIALIZED')
    compiler.runWatch(projectRoot)
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
    console.log('  build <rootDir>                Use specified root directory')
    console.log('  css <rootDir>                Use specified root directory')
}