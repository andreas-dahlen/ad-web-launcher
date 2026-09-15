import path from 'node:path'
import { fileURLToPath } from 'node:url'

export function findPackageRoot(): string {
  let directory = path.dirname(fileURLToPath(import.meta.url))

  while (true) {
    const name = path.basename(directory)

    if (name === 'src') {
      throw new Error(
        'Cannot resolve Cascade package root from source code.',
      )
    }

    if (name === 'dist') {
      return path.dirname(directory)
    }

    const parent = path.dirname(directory)

    if (parent === directory) {
      throw new Error(
        'Could not find Cascade package dist directory.',
      )
    }

    directory = parent
  }
}