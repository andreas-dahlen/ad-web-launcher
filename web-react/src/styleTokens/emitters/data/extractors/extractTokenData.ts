import path from 'node:path'
import type { CssTokenGroup } from '../../../types/compiler.types'
import type { ValidPrefix } from '../../../../shared/tokenUtils/compiler.types'
import { toCamelCase, toPascalCase } from '../../../../shared/tokenUtils/stringFormaters.ts'
import extractGroupName from '../../../compiler/resolvers/extractGroupName.ts'

export type TokenGroupFileData = {
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
  name: string
  key: string
  allowed: ValidPrefix[]
}

export default function extractTokenData(group: CssTokenGroup): TokenGroupFileData {

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
        name: v.name ?? v.key,
        key: v.key,
        allowed: v.effectiveAllowed
      }
    })
    tokens.push({ variables, infix: token.infix })
  }

  return {
    name,
    styleName,
    typeName,
    tokenFile,
    tokens
  }
}