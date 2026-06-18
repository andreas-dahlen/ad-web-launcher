
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
  return str
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .toLowerCase();
}

function toDataAttr(key: string): `data-${string}` {
  const kebab = toKebab(key)
  return kebab.startsWith('data-') ? kebab as DataString : `data-${kebab}`
}

/** converts object into data-attrs */
export function dasx(state: DataState = {}) {
  const result: DataAttrsResult = {}

  for (const [key, value] of Object.entries(state)) {
    if (value == null || key == null) continue


    // if (typeof value === "boolean") {
    //   result[toDataAttr(key)] = value ? "true" : "false"
    // }

    result[toDataAttr(key)] = String(value)
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