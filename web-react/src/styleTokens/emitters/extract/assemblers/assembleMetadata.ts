import { extractGroupName } from '../../../compiler/resolvers/extractGroupName.ts'
import type { CssTokenGroup } from '@styleTokens/types/compiler.types.ts'

export type GroupMetadata = {
  name: string
  groupPath: string
  tokenFiles: string[]
  cssFile: string
}
export function assembleMetadata(group: CssTokenGroup): GroupMetadata {

  const name = extractGroupName(group.groupPath)
  return {
    name,
    groupPath: group.groupPath,
    tokenFiles: group.tokens.map(g => g.tokenPath),
    cssFile: group.cssPath,
  }
}