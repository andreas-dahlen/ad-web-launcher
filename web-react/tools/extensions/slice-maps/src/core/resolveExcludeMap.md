# SliceMap Resolution — Desired Behavior

`resolveSliceMap` resolves a single user action against the current `SliceMap` and returns the next map.

The action is represented by `resolvedPath.type`:

* `includeFiles`
* `includeFolders`
* `excludeFiles`
* `excludeFolders`

The resolver operates on the map's **explicit declarations**. It does not determine final filesystem visibility; that is handled later by the exclusion/resolution handler.

---

## Core Rules

### 1. The current action has priority

The user's current action always wins over an existing declaration for the same path.

Therefore:

* `includeFile` removes the same path from `excludeFiles`.
* `excludeFile` removes the same path from `includeFiles`.
* `includeFolder` removes the same path from `excludeFolders`.
* `excludeFolder` removes the same path from `includeFolders`.

---

### 2. Folder actions own their entire subtree

A folder action applies to everything beneath that folder.

When a folder is included, all existing declarations beneath it are resolved in favor of **include**.

When a folder is excluded, all existing declarations beneath it are resolved in favor of **exclude**.

This keeps the resulting map simple and makes the user's action predictable.

#### `includeFolder`

Given:

```text
includeFolder: src
```

the resolver removes all existing declarations beneath `src` that are now redundant or conflicting:

* descendant `includeFiles`
* descendant `includeFolders`
* descendant `excludeFiles`
* descendant `excludeFolders`

The resulting map contains the `src` folder declaration unless an ancestor already includes it.

#### `excludeFolder`

Given:

```text
excludeFolder: src
```

the resolver removes all existing declarations beneath `src`:

* descendant `includeFiles`
* descendant `includeFolders`
* descendant `excludeFiles`
* descendant `excludeFolders`

The resulting map contains the `src` folder declaration unless an ancestor already excludes it.

---

### 3. Parent declarations make descendants redundant

A declaration is unnecessary when an ancestor already provides the same result.

For example:

```text
includeFolders:
  src
  src/generated
```

resolves to:

```text
includeFolders:
  src
```

Likewise:

```text
excludeFolders:
  src
  src/generated
```

resolves to:

```text
excludeFolders:
  src
```

The same principle applies when deciding whether an individual file needs an explicit declaration.

A file does not need to be explicitly included when an ancestor is already included.

A file does not need to be explicitly excluded when an ancestor is already excluded.

---

## `includeFiles`

Adding a file means:

1. Remove the file from `excludeFiles`.
2. If the file is already covered by an ancestor in `includeFolders`, do not add an explicit `includeFiles` entry.
3. Otherwise, add the file to `includeFiles`.

Example:

```text
Existing:

excludeFiles:
  src/config.ts
```

Action:

```text
includeFiles:
  src/config.ts
```

Result:

```text
includeFiles:
  src/config.ts
```

The explicit file action overrides the previous declaration for that path.

An existing `excludeFolders` declaration is not modified by an `includeFiles` action.

---

## `excludeFiles`

Excluding a file means:

1. Remove the file from `includeFiles`.
2. If the file is already covered by an ancestor in `excludeFolders`, do not add an explicit `excludeFiles` entry.
3. Otherwise, add the file to `excludeFiles`.

Example:

```text
Existing:

includeFiles:
  src/config.ts
```

Action:

```text
excludeFiles:
  src/config.ts
```

Result:

```text
excludeFiles:
  src/config.ts
```

The explicit file action overrides the previous declaration for that path.

An existing `includeFolders` declaration is not modified by an `excludeFiles` action.

---

## `includeFolders`

Including a folder means:

1. Remove the same folder from `excludeFolders`.
2. Remove every existing declaration beneath the folder.
3. If the folder is already covered by an ancestor in `includeFolders`, do not add it explicitly.
4. Otherwise, add the folder to `includeFolders`.

Example:

```text
Existing:

includeFolders:
  src
  src/generated

includeFiles:
  src/generated/config.ts

excludeFolders:
  src/generated/tests

excludeFiles:
  src/generated/schema.ts
```

Action:

```text
includeFolders:
  src/generated
```

The declarations beneath `src/generated` are resolved in favor of the new include action.

The resulting state is effectively:

```text
includeFolders:
  src
```

because `src/generated` is already covered by `src`.

The child declarations are no longer needed.

---

## `excludeFolders`

Excluding a folder means:

1. Remove the same folder from `includeFolders`.
2. Remove every existing declaration beneath the folder.
3. If the folder is already covered by an ancestor in `excludeFolders`, do not add it explicitly.
4. Otherwise, add the folder to `excludeFolders`.

Example:

```text
Existing:

excludeFolders:
  src
  src/generated

excludeFiles:
  src/generated/config.ts

includeFolders:
  src/generated/tests

includeFiles:
  src/generated/schema.ts
```

Action:

```text
excludeFolders:
  src/generated
```

The declarations beneath `src/generated` are resolved in favor of the new exclude action.

The resulting state is effectively:

```text
excludeFolders:
  src
```

because `src/generated` is already covered by `src`.

The child declarations are no longer needed.

---

# Examples of Folder Ownership

### Include a folder

```text
Before:

includeFolders:
  src

excludeFolders:
  src/generated

includeFiles:
  src/foo.ts

excludeFiles:
  src/bar.ts
```

Action:

```text
includeFolders:
  src
```

Result:

```text
includeFolders:
  src

excludeFolders:
includeFiles:
excludeFiles:
```

The `src` declaration owns the entire subtree.

---

### Exclude a folder

```text
Before:

excludeFolders:
  src

includeFolders:
  src/generated

includeFiles:
  src/foo.ts

excludeFiles:
  src/bar.ts
```

Action:

```text
excludeFolders:
  src
```

Result:

```text
excludeFolders:
  src

includeFolders:
excludeFiles:
includeFiles:
```

Again, the folder declaration owns the entire subtree.

---

# Resolution vs Filesystem Visibility

`resolveSliceMap` answers:

> Given the current map and this user action, what should the next explicit `SliceMap` contain?

It does **not** answer:

> Which files and folders should ultimately be visible?

That second question belongs to the resolution/exclusion stage.

The pipeline is therefore:

```text
user action
    ↓
resolveTargetMap()
    ↓
resolvedPath
    ↓
resolveSliceMap()
    ↓
canonical SliceMap
    ↓
createResolution()
    ↓
filesystem exclusions
```

The important distinction is:

> **`resolveSliceMap` resolves declarations. `createResolution` resolves filesystem visibility.**
