import { loadTokenFile } from '../loaders/loadTokenFile.ts';
import type { TokenResult } from '../../types/compiler.types.ts'
import { assert } from '../processing/assertions.ts';
import { parseToken } from './parseToken.ts';
import { createIssueCollector } from '../tracking/issueCollector.ts';

export function processToken(fullPath: string): TokenResult {
  const { json, errors } = loadTokenFile(fullPath)
  const collector = createIssueCollector()

  assert.token(errors, json, fullPath)

  collector.setSubject("String Parsing")

  collector.scope({ value: json.component, path: fullPath, context: "component" })

  const componentResult = parseToken.identifier(json.component, collector)

  if (json.infix) {
    collector.editScope({ value: json.infix, context: "infix" })
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

        assert.variable(key, def, fullPath)

        const variableResult = parseToken.variable(def, key, alwaysAllowed, collector)

        return {
          ...variableResult.variable,
        };
      })
    },
    issues: collector.flush()
  }
}