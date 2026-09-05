import { defineRule } from '@oxlint/plugins'

import { getInternalAliases } from './helpers/getInternalAliases.ts'
import { resolveProjectRoot } from '../helpers/resolveProjectRoot.ts'

let internalAliases: string[] | undefined

export default defineRule({
  meta: {
    type: 'problem',
    docs: {
      description: 'Prevent importing local @ imports without file extensions'
    }
  },

  create(context) {
    const projectRoot = resolveProjectRoot(
      context.cwd,
      context.settings
    )

    internalAliases ??= getInternalAliases(projectRoot)

    const aliases = internalAliases

    return {
      ImportDeclaration(node) {
        const source = node.source.value

        if (
          typeof source !== 'string' ||
          !aliases.some(alias => source.startsWith(alias)) ||
          node.specifiers.some(
            specifier => specifier.type === 'ImportNamespaceSpecifier'
          )
        ) {
          return
        }

        if (!source.endsWith('.ts') && !source.endsWith('.tsx')) {
          context.report({
            node: node.source,
            message: '@ imports need to end with .ts or .tsx'
          })
        }
      }
    }
  }
})