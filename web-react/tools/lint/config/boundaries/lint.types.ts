// export type OxlintSeverity =
//   | 'error'
//   | 'warn'
//   | 'deny'
//   | 'off'
//   | 'allow'
//   | number

// export type OxlintRule =
//   | OxlintSeverity
//   | readonly [OxlintSeverity, ...unknown[]]

// export type OxlintRules =
//   Readonly<Record<string, OxlintRule>>

// export type OxlintOverride = {
//   files: string[]
//   rules: OxlintRules
//   ignores?: readonly string[]
// }

export type OxlintSeverity =
  | 'error'
  | 'warn'
  | 'deny'
  | 'off'
  | 'allow'
  | number

export type OxlintRule = [
  OxlintSeverity,
  ...unknown[],
]

export type OxlintRules = Record<string, OxlintRule>

export type BoundaryRule = [
  'error',
  {
    default: 'disallow'
    policies: unknown[]
  },
]

export type GenericErrorRule = [
  'error',
  {}
]