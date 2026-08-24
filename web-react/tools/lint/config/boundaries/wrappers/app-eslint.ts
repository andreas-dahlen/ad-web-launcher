import type { Linter } from 'eslint'
import { appRules } from '../app.rules'

export const appBoundaries: Linter.Config = {
  files: ['src/**/*.{ts,tsx}'],
  rules: appRules
}