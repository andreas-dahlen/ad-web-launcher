import path from 'node:path'
import { extractGroupName } from '../../../compiler/resolvers/extractGroupName.js'
import type { CssTokenGroup } from '../../../types/compiler.types.js'

export type GroupMetadata = {
  name: string
  groupPath: string
  tokenFiles: string[]
  cssFile: string
  outputFile: string
}
export function assembleMetadata(group: CssTokenGroup, outPath: string): GroupMetadata {
  const outputFile = path.join(outPath, "metadata/metadata.json")
  const name = extractGroupName(group.groupPath)
  return {

    name,
    groupPath: group.groupPath,
    tokenFiles: group.tokens.map(g => g.tokenPath),
    cssFile: group.cssPath,
    outputFile
  }
}