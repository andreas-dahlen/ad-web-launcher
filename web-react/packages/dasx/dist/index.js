function toDataAttr(key) {
    const kebab = key.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
    return kebab.startsWith("data-")
        ? kebab
        : `data-${kebab}`;
}
/** Converts values into data-attribute entries. */
export default function dasx(...states) {
    const attrs = {};
    for (const state of states) {
        for (const [key, value] of Object.entries(state)) {
            if (value == null)
                continue;
            attrs[toDataAttr(key)] = String(value);
        }
    }
    return attrs;
}
//# sourceMappingURL=index.js.map