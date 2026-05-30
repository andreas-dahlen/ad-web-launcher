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