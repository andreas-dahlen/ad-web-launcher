import { loadTokenFile } from '../loaders/loadTokenFile.ts'
import type { RawToken, TokenResult } from '../../types/compiler.types.ts'
import { parseToken } from './parseToken.ts'
import { createIssueCollector } from '../tracking/issueCollector.ts'

export function processToken(fullPath: string): TokenResult {
  const collector = createIssueCollector()

  let json: RawToken

  try {
    json = loadTokenFile(fullPath)
  } catch (error) {
    collector.setSubject('Token File')

    collector.scope({
      value: fullPath,
      path: fullPath,
      context: 'file',
    })

    collector.set({
      reason: error instanceof Error
        ? error.message
        : String(error),
    })

    return {
      token: undefined,
      issues: collector.flush(),
    }
  }

  collector.setSubject('String Parsing')

  collector.scope({
    value: json.component,
    path: fullPath,
    context: 'component',
  })

  const componentResult = parseToken.identifier(
    json.component,
    collector,
  )

  if (json.infix) {
    collector.editScope({
      value: json.infix,
      context: 'infix',
    })
  }

  const infixResult = json.infix
    ? parseToken.identifier(json.infix, collector)
    : componentResult

  const component = componentResult.name
  const infix = infixResult.name
  const alwaysAllowed = json.alwaysAllowed ?? []

  return {
    token: {
      name: component,
      tokenPath: fullPath,
      infix,
      vars: Object.entries(json.vars ?? {}).map(([key, def]) => {
        const variableResult = parseToken.variable(
          def,
          key,
          alwaysAllowed,
          collector,
        )

        return {
          ...variableResult.variable,
        }
      }),
    },
    issues: collector.flush(),
  }
}
