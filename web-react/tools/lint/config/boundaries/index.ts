import type { OxlintOverride } from 'oxlint'
import { appRules } from './rules/app.rules.ts'
import { compilerRules } from './rules/compiler.rules.ts'
import { matchSuggestionsRules } from './rules/match-suggestions.rules.ts'
import { cascadeVscodeRules } from './rules/cascade-vscode.rules.ts'
import { cssVariableCompletionRules } from './rules/css-variable-completion.rules.ts'
import { projectLintRules } from './rules/project-lint.rules.ts'

export const appBoundaries: OxlintOverride = {
  files: ['src/**/*.{ts,tsx}'],
  rules: appRules
}
export const compilerBoundaries: OxlintOverride = {
  files: ['tools/cascade-compiler/src/**/*.{ts, js}'],
  rules: compilerRules
}
export const matchSuggestionsBoundaries: OxlintOverride = {
  files: ['tools/extensions/match-suggestions/src/**/*.{ts, js}'],
  rules: matchSuggestionsRules
}
export const cascadeVscodeBoundaries: OxlintOverride = {
  files: ['tools/extensions/cascade-vscode/src/**/*.{ts, js}'],
  rules: cascadeVscodeRules
}
export const cssVariableCompletionBoundaries: OxlintOverride = {
  files: ['tools/extensions/css-variable-completion/src/**/*.{ts, js}'],
  rules: cssVariableCompletionRules
}
export const projectLintBoundaries: OxlintOverride = {
  files: ['tools/extensions/project-lint/src/**/*.{ts, js}'],
  rules: projectLintRules
}