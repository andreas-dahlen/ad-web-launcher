import type { CompilerToken } from '@styleTokens/types/compiler.types'

export const token_DEFAULT = {
  component: 'button',
  vars: {
    color: {
      value: '#ffffff',
    }
  }
} as const

export const compilerToken_DEFAULT = {
  name: 'button',
  tokenPath: '/tokens/button.jsonc',
  infix: 'button',
  vars: [
    {
      key: 'color',
      name: 'color',
      values: {},
      effectiveAllowed: ["o", "p", "f"]
    }
  ]
} satisfies CompilerToken