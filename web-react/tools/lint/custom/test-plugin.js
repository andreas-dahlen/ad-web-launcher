export default {
  rules: {
    'test-rule': {
      meta: {
        type: 'problem',
        docs: {
          description: 'test rule',
        },
      },

      create(context) {
        return {
          Program(node) {
            context.report({
              node,
              message: 'JS plugin is alive!',
            })
          },
        }
      },
    },
  },
}