import type { CssTokenGroup } from '../../../types/compiler.types.ts'
import { toCamelCase, toPascalCase } from '../../../utils/stringFormaters.ts'
import { extractGroupName } from '../../../compiler/resolvers/extractGroupName.ts'
import type { TokenData, TokenGroupData } from '../../../types/emitter.types.ts'

export function assembleTokenData(
  group: CssTokenGroup
): TokenGroupData {

  const rawName = extractGroupName(group.groupPath)

  const name = toCamelCase(rawName)

  const styleName = `${name}Style`;
  const typeName = `${toPascalCase(rawName)}Style`

  // const outputFile = `tokenModules/${name}.token.ts`

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
    groupPath: group.groupPath,
    name,
    styleName,
    typeName,
    tokens
  }
}