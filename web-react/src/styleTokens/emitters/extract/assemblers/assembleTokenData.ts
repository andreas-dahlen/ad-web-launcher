import path from 'node:path'
import type { CssTokenGroup } from '../../../types/compiler.types.ts'
import type { ValidPrefix } from '../../../../shared/tokenUtils/compiler.types.ts'
import { toCamelCase, toPascalCase } from '../../../../shared/tokenUtils/stringFormaters.ts'
import { extractGroupName } from '../../../compiler/resolvers/extractGroupName.ts'

export type TokenGroupData = {
  groupPath: string
  name: string
  styleName: string
  typeName: string
  tokenFile: string
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

export function assembleTokenData(group: CssTokenGroup): TokenGroupData {

  const rawName = extractGroupName(group.groupPath)

  const name = toCamelCase(rawName)

  const styleName = `${name}Style`;
  const typeName = `${toPascalCase(rawName)}Style`

  const generatedDir = path.resolve("./src/shared/generated/tokenModules");
  const tokenFile = path.join(generatedDir, `${name}.token.ts`);

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
    tokenFile,
    tokens
  }
}