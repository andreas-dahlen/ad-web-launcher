import { defineRule } from '@oxlint/plugins'
import { resolveProjectRoot } from '../helpers/resolveProjectRoot.ts'
import { resolveImportPath } from '../helpers/resolveImportPath.ts'
import fs from 'node:fs'

export default defineRule({
  meta: {
    type: 'problem',
    docs: {
      description: `Prevent importing .ts or .tsx files that don't exist`
    }
  },

  create(context) {
    const projectRoot = resolveProjectRoot(
      context.cwd,
      context.settings
    )

    return {
      ImportDeclaration(node) {
        const source = node.source.value

        if (
          typeof source !== 'string' ||
          (!source.endsWith('.ts') && !source.endsWith('.tsx'))
        ) {
          return
        }
        const filePath = resolveImportPath(
          source,
          context.filename,
          projectRoot
        )

        if (filePath && !fs.existsSync(filePath)) {
          context.report({
            node: node.source,
            message: `Imported file does not exist: ${source}`
          })
        }
      }
    }
  }
})