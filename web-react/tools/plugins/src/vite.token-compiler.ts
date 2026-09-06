import fs from 'node:fs'
import path from 'node:path'
import { spawn } from 'node:child_process'
import type { Plugin } from 'vite'
import { parse } from 'jsonc-parser'

type CompilerConfig = {
  cliFile: string
}

export function tokenCompiler(): Plugin {
  return {
    name: 'token-compiler',
    apply: 'build',

    async buildStart() {
      const projectRoot = process.cwd()
      const config = loadConfig(projectRoot)

      if (!config) {
        this.warn('compiler.config.json not found — token compiler disabled')
        return
      }

      const cliFile = path.resolve(projectRoot, config.cliFile)

      await runCompiler(cliFile, projectRoot)
    },
  }
}

function loadConfig(projectRoot: string): CompilerConfig | null {
  const configPath = path.join(
    projectRoot,
    'compiler.config.json',
  )

  if (!fs.existsSync(configPath)) {
    return null
  }

  return parse(
    fs.readFileSync(configPath, 'utf8'),
  )
}

function runCompiler(
  cliFile: string,
  projectRoot: string,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const compiler = spawn(
      process.execPath,
      [
        cliFile,
        'build',
        projectRoot,
      ],
      {
        stdio: 'inherit',
      },
    )

    compiler.on('error', reject)

    compiler.on('close', code => {
      if (code === 0) {
        resolve()
        return
      }

      reject(
        new Error(`Token compiler exited with code ${code}`),
      )
    })
  })
}