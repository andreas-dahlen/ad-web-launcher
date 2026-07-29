import { toKebab } from '@shared/tokenUtils/stringFormaters'

type DataValue =
  | string
  | number
  | boolean
  | null
  | undefined

type DataState = Record<string, DataValue>

type DataString = `data-${string}`

type DataAttrsResult = Record<DataString, string>


function toDataAttr(key: string): DataString {
  const kebab = toKebab(key)
  return kebab.startsWith('data-') ? kebab as DataString : `data-${kebab}`
}

/** Transforms an object into data-attribute entries */
export function dasx(state: DataState = {}) {
  const result: DataAttrsResult = {}

  for (const [key, value] of Object.entries(state)) {
    if (value == null || key == null) continue
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