import type { Linter } from 'eslint'
import { appRules } from '../app.rules.ts'
import { compilerRules } from '../compiler.rules.ts'

export const appBoundaries: Linter.Config = {
  files: ['src/**/*.{ts,tsx}'],
  rules: appRules
}

export const compilerBoundaries: Linter.Config = {
  files: ['tools/token-compiler/src/**/*.{ts, js}'],
  rules: compilerRules
}