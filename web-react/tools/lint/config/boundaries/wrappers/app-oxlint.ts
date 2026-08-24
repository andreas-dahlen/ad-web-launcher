import { appRules } from '../app.rules.ts'
import type { OxlintOverride } from 'oxlint'

export const appBoundaries: OxlintOverride = {
  files: ['src/**/*.{ts,tsx}'],
  rules: appRules
}