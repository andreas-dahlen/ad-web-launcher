import { assertPrefixes, type Issue } from '../../../shared/tokenUtils/prefixes'
import type { RawVarDef, ValidPrefix } from '../../../shared/tokenUtils/compiler.types'
import type { LoadedVariable } from '../../types/compiler.types'
import { prefixLeadingNumber, removeInvalidCharacters, toCamelCase, escapeReservedWord } from '../../../shared/tokenUtils/stringFormaters.ts'
import createIssueCollector from '../../../shared/tokenUtils/issueCollector.ts'
import { resolveAllowedPrefixes } from '../../../shared/tokenUtils/resolveAllowedPrefixes.ts'

type Parse = {
  identifier(original: string, property: string, path: string): { name: string, issues: Issue[] }
  variable(rawVar: RawVarDef, key: string, alwaysAllowed: ValidPrefix[], path: string): { variable: LoadedVariable, issues: Issue[] }
}

const parse: Parse = {
  identifier(original, path, property?) {
    const collector = createIssueCollector("Parse", original, path, property)
    let name = original

    const normalized = toCamelCase(name)
    if (normalized !== name) {
      collector.setIssue("converted to camelCase")
      name = normalized
    }
    const fixedName = removeInvalidCharacters(name)
    if (fixedName !== name) {
      collector.setIssue("modified invalid characters")
      name = fixedName
    }
    const leadingName = prefixLeadingNumber(name)
    if (leadingName !== name) {
      collector.setIssue("prefixed leading number")
      name = leadingName
    }
    const escaped = escapeReservedWord(name)
    if (escaped !== name) {
      collector.setIssue("prefixed reserved word")
      name = escaped
    }
    if (!name) {
      throw new Error(`identifier "${original}" (${property ?? "unknown"}) was empty after parsing, in file ${path}`)
    }
    return { name, issues: collector.flushIssues() }
  },



  variable(rawVar, key, alwaysAllowed, path) {
    const keyResult = parse.identifier(
      key,
      path,
      "variable key"
    )
    const name = rawVar.name ?? keyResult.name
    const allowed = assertPrefixes(rawVar.allowed)
    const exclude = assertPrefixes(rawVar.exclude)
    const prefixes = resolveAllowedPrefixes(allowed, alwaysAllowed, exclude, {
      name: keyResult.name,
      path,
    })
    return {
      variable: {
        key: keyResult.name,
        name,
        effectiveAllowed: prefixes.effectiveAllowed,
        values: rawVar.values ?? {}
      },
      issues: [
        ...keyResult.issues,
        ...prefixes.issues
      ]
    }
  }
}


export default parse