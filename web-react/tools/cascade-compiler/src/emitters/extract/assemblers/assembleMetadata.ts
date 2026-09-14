import { extractGroupName } from '../../../compiler/resolvers/extractGroupName.ts'
import type { CssTokenGroup } from '../../../types/compiler.types.ts'
import type { GroupMetadata } from '../../../types/emitter.types.ts'

export function assembleMetadata(group: CssTokenGroup): GroupMetadata {
  const outputFile = "metadata/metadata.jsonc"
  const name = extractGroupName(group.groupPath)
  return {

    name,
    groupPath: group.groupPath,
    tokenFiles: group.tokens.map(g => g.tokenPath),
    cssFile: group.cssPath,
    outputFile
  }
}