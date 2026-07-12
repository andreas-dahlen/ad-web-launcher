export function generateId() {
  return Math.random().toString(36).slice(2, 10)
}

export function createId(
  inputType: string,
  inputId?: string,
  inputInfix?: string
) {
  const normalize = (value?: string) =>
    value
      ?.toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9_-]/g, "")

  const id = inputId ? normalize(inputId) : generateId()
  const infix = normalize(inputInfix)
  const type = normalize(inputType)

  return inputInfix
    ? `${type}_${infix}_${id}`
    : `${type}_${id}`
}