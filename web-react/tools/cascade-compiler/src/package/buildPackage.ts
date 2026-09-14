import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'


export function buildPackage(outDir: string): void {
  let directory = path.resolve(outDir)

  while (true) {
    const packageJsonPath = path.join(directory, 'package.json')

    if (existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(
        readFileSync(packageJsonPath, 'utf8'),
      )

      if (packageJson.name !== 'cascade') {
        return
      }

      execFileSync(
        process.platform === 'win32' ? 'npm.cmd' : 'npm',
        ['run', 'build'],
        {
          cwd: directory,
          stdio: 'inherit',
        },
      )

      return
    }

    const parent = path.dirname(directory)

    if (parent === directory) {
      return
    }

    directory = parent
  }
}