export const createId = (prefix?: string) => {
  const id = Math.random().toString(36).slice(2, 10)
  return prefix ? `${prefix}-${id}` : id
}