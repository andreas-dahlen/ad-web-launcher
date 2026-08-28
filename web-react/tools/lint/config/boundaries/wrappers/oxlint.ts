import { appRules } from '../app.rules.ts'
import type { OxlintOverride } from 'oxlint'
import { compilerRules } from '../compiler.rules.ts'

export const appBoundaries: OxlintOverride = {
  files: ['src/**/*.{ts,tsx}'],
  rules: appRules
}

export const compilerBoundaries: OxlintOverride = {
  files: ['tools/token-compiler/src/**/*.{ts, js}'],
  rules: compilerRules
}