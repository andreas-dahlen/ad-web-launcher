import fs from 'node:fs'
import path from 'node:path'


export function loadRootEntries(root: string): {
  includeFiles: string[]
  includeFolders: string[]
} {
  const includeFiles: string[] = []
  const includeFolders: string[] = []

  for (const name of fs.readdirSync(root)) {
    const entryPath = path.join(root, name)
    const relativePath = path.relative(root, entryPath)

    if (fs.statSync(entryPath).isFile()) {
      includeFiles.push(relativePath)
    } else {
      includeFolders.push(relativePath)
    }
  }

  return { includeFiles, includeFolders }
}