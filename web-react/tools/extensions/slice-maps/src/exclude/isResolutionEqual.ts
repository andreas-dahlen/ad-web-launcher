export function isResolutionEqual(
  prev: Record<string, true>,
  current: Record<string, true>
): boolean {

  const prevStrings = Object.keys(prev)
  const currentStrings = Object.keys(current)

  if (prevStrings.length !== currentStrings.length) return false

  return prevStrings.every(path => current[path] === true)
}