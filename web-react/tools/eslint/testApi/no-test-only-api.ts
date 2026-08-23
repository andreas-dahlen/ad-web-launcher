import path from 'node:path'
import type { Rule } from 'eslint'

const rule: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Prevent importing __TEST_ONLY_API outside tests'
    },
    schema: [],
    messages: {
      forbidden: '__TEST_ONLY_API is only available in test files'
    }
  },

  create(context) {
    const filename = context.filename.split(path.sep).join('/')

    const isTestFile = filename.includes('/src/test/')

    if (isTestFile) {
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
              messageId: 'forbidden'
            })
          }
        }
      }
    }
  }
}

export default rule