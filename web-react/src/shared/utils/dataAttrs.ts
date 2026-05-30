
type DataValue =
  | string
  | number
  | boolean
  | null
  | undefined

type DataState = Record<string, DataValue>

type DataString = `data-${string}`

type DataAttrsResult = Record<DataString, string>

function toKebab(str: string): string {
  return str.replace(/[A-Z]/g, (m) => '-' + m.toLowerCase())
}

function toDataAttr(key: string): `data-${string}` {
  return `data-${toKebab(key)}`
}

/** converts object into data-attrs */
export function dasx(state: DataState = {}) {
  const result: DataAttrsResult = {}

  for (const [key, value] of Object.entries(state)) {
    if (value == null || key == null) continue

    const resolved = value

    if (resolved == null) continue
    if (typeof resolved === "boolean") {
      result[toDataAttr(key)] = resolved ? "true" : "false"
    }

    result[toDataAttr(key)] = String(resolved)
  }
  return result
}

// API ...dasx({
//   open: isOpen ? 'open' : 'closed',
//   mode: isEdit ? 'edit' : 'view',

//   is-open: true,
//   is-active: "yes",
//   active: false,
//   is-disabled: false,
//   is-mode: "expanded"
// })

// className={clsx(
//   "button",
//   isActive && "active",
//   isActive && Styles.active
// 'is-active': isActive
// )}