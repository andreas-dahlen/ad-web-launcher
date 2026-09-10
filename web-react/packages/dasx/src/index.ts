type DataValue = string | number | boolean | null | undefined

type DataState = Readonly<Record<string, DataValue>>

type DataAttrs = Record<`data-${string}`, string>

function toDataAttr(key: string): `data-${string}` {
  const kebab = key.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase()

  return kebab.startsWith("data-")
    ? kebab as `data-${string}`
    : `data-${kebab}`
}

/** Converts values into data-attribute entries. */
export default function dasx(...states: DataState[]): DataAttrs {
  const attrs: DataAttrs = {}

  for (const state of states) {
    for (const [key, value] of Object.entries(state)) {
      if (value == null) continue
      attrs[toDataAttr(key)] = String(value)
    }
  }

  return attrs
}