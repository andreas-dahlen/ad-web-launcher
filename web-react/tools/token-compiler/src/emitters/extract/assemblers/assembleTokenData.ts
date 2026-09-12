import path from 'node:path'
import type { CssTokenGroup } from '../../../types/compiler.types.ts'
import { toCamelCase, toPascalCase } from '../../../oldSharedUtils/stringFormaters.ts'
import { extractGroupName } from '../../../compiler/resolvers/extractGroupName.ts'
import type { TokenData, TokenGroupData } from '../../../types/emitter.types.ts'

export function assembleTokenData(
  group: CssTokenGroup,
  outPath: string
): TokenGroupData {

  const rawName = extractGroupName(group.groupPath)

  const name = toCamelCase(rawName)

  const styleName = `${name}Style`;
  const typeName = `${toPascalCase(rawName)}Style`

  const outputFile = path.join(outPath, `tokenModules/${name}.token.ts`);

  const tokens: TokenData[] = []

  for (const token of group.tokens) {
    const variables = token.vars.map((v) => {
      return {
        cssName: v.cssName,
        key: v.key,
        allowed: v.effectiveAllowed,
        values: v.values
      }
    })
    tokens.push({ variables, infix: token.infix })
  }

  return {
    outputFile,
    groupPath: group.groupPath,
    name,
    styleName,
    typeName,
    tokens
  }
}