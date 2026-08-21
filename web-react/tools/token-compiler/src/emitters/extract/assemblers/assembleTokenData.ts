import path from 'node:path'
import type { CssTokenGroup } from '../../../types/compiler.types.js'
import type { ValidPrefix } from '../../../oldSharedUtils/oldSharedCompiler.types.js'
import { toCamelCase, toPascalCase } from '../../../oldSharedUtils/stringFormaters.js'
import { extractGroupName } from '../../../compiler/resolvers/extractGroupName.js'

export type TokenGroupData = {
  groupPath: string
  name: string
  styleName: string
  typeName: string
  outputFile: string
  tokens: TokenData[]
}
export type TokenData = {
  infix: string
  variables: VarData[];
}
type VarData = {
  cssName: string
  key: string
  allowed: ValidPrefix[]
  values: Partial<Record<ValidPrefix, string>>
}

export function assembleTokenData(group: CssTokenGroup, outPath: string): TokenGroupData {

  const rawName = extractGroupName(group.groupPath)

  const name = toCamelCase(rawName)

  const styleName = `${name}Style`;
  const typeName = `${toPascalCase(rawName)}Style`

  const outputFile = path.join(outPath, `${name}.token.ts`);

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