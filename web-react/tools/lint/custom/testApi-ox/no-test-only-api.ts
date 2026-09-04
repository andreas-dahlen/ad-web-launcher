import path from 'node:path';
import { defineRule } from '@oxlint/plugins'

export default defineRule({
  meta: {
    type: 'problem',
    docs: {
      description: 'Prevent importing __TEST_ONLY_API outside tests'
    }
  },

  create(context) {
    const filename = context.filename.split(path.sep).join('/')

    if (filename.includes('/src/test/')) {
      return {}
    }

    return {
      ImportDeclaration(node) {
        for (const specifier of node.specifiers) {
          if (
            specifier.type === 'ImportSpecifier' &&
            specifier.imported.type === 'Identifier' &&
            specifier.imported.name === '__TEST_ONLY_API'
          ) {
            context.report({
              node: specifier,
              message: '__TEST_ONLY_API is only available in test files'
            })
          }
        }
      }
    }
  }
})