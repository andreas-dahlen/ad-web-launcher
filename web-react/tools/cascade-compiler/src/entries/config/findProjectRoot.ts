import { existsSync } from 'node:fs'
import path from 'node:path'

export function findProjectRoot(startDirectory: string): string {
  let directory = path.resolve(startDirectory)

  while (true) {
    const configPath = path.join(directory, 'cascade.config.json')

    if (existsSync(configPath)) {
      return directory
    }

    const parent = path.dirname(directory)

    if (parent === directory) {
      throw new Error(
        `Could not find cascade.config.json from ${startDirectory}`,
      )
    }

    directory = parent
  }
}