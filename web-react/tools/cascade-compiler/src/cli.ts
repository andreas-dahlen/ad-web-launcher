#!/usr/bin/env node

import { compiler } from './entries/entry.ts'

const [command, rootDir] = process.argv.slice(2)

const startDirectory = rootDir ?? process.cwd()

switch (command) {
  case 'watch': {
    console.log('CASCADE COMPILER INITIALIZED')
    compiler.runWatch(startDirectory)
    break
  }

  case 'build': {
    compiler.runBuild(startDirectory)
    break
  }

  case 'css': {
    compiler.runCss(startDirectory)
    break
  }

  default:
    console.log('Options:')
    console.log('  watch [rootDir]')
    console.log('  build [rootDir]')
    console.log('  css   [rootDir]')
}