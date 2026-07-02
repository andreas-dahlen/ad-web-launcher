export type DataAttributes = {
  [key: `${string}`]:
  string |
  number |
  boolean |
  undefined
}

//base
export type BaseProps = {
  id: string
  className?: string
  interactive?: boolean
}

export type LabelWeight =
  | "light"
  | "regular"
  | "medium"
  | "sbold"
  | "bold"
  | "xbold"

const weightMap: Record<LabelWeight, number> = {
  light: 300,
  regular: 400,
  medium: 500,
  sbold: 600,
  bold: 700,
  xbold: 800,
}
export function calcWeight(weight: LabelWeight = "regular"): number {
  return weightMap[weight]
}