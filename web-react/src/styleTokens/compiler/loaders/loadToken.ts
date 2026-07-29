import loadTokenFile from './loadTokenFile.ts';
import { assertPrefixes } from '../../../shared/tokenUtils/prefixes.ts';
import type { LoadedTokenResult } from '../../types/compiler.types.ts'
import assert from '../assertions/assertions.ts';
import parse from './parse.ts';
import createIssueCollector from '../../../shared/tokenUtils/issueCollector.ts';

export default function loadToken(fullPath: string): LoadedTokenResult {
  const { json, errors } = loadTokenFile(fullPath)
  const collector = createIssueCollector("Token", json.component, fullPath)

  assert.token(errors, json, fullPath)

  const componentResult = parse.identifier(json.component, fullPath, "component")
  collector.addIssues(componentResult.issues)

  const infixResult = json.infix
    ? parse.identifier(json.infix, fullPath, "infix")
    : componentResult

  if (json.infix) {
    collector.addIssues(infixResult.issues)
  }
  const component = componentResult.name
  const infix = infixResult.name

  // const infix = json.infix ?? json.component;
  const alwaysAllowed = assertPrefixes(json.alwaysAllowed)

  return {
    token: {
      name: component,
      tokenPath: fullPath,
      infix,
      alwaysAllowed: alwaysAllowed,
      vars: Object.entries(json.vars ?? {}).map(([key, def]) => {

        assert.variable(key, def, fullPath)

        const variableResult = parse.variable(def, key, alwaysAllowed, fullPath)
        // const variableName =
        //   typeof def.name === "string" && def.name.trim()
        //     ? def.name.trim()
        //     : key;

        // const allowed = assertPrefixes(def.allowed)
        // const exclude = parsePrefixes(def.exclude)
        collector.addIssues(variableResult.issues)
        return {
          // key,
          // name: variableName,
          // allowed: allowed,
          // exclude: exclude,
          // values: def.values || {},
          // effectiveAllowed: getAllowedPrefixes(allowed, alwaysAllowed, exclude)

          ...variableResult.variable,

        };
      })
    },
    issues: collector.flushIssues()
  }
}