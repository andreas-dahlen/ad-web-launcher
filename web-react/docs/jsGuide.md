# JavaScript — Higher-Order Functions Cheat Sheet

## Lambda (arrow function) syntax

```js
(x) => x * 2              // expression body — implicit return
(x) => { return x * 2 }  // block body — explicit return required
(a, b) => a + b           // multiple params
() => 42                  // no params
(x) => ({ key: x })       // returning an object literal — wrap in parens
```

---

## Array methods

### `.map()`
**Callback receives:** `item, index, array`  
**Callback returns:** transformed value  
**Method returns:** new array (same length)

```js
[1, 2, 3].map(x => x * 2)
// [2, 4, 6]
```

---

### `.filter()`
**Callback receives:** `item, index, array`  
**Callback returns:** boolean — truthy = keep  
**Method returns:** new array (subset)

```js
[1, 2, 3, 4].filter(x => x > 2)
// [3, 4]
```

---

### `.reduce()`
**Callback receives:** `accumulator, item, index, array`  
**Callback returns:** next accumulator value  
**Method returns:** single value (any type)

```js
[1, 2, 3].reduce((acc, x) => acc + x, 0)
// 6
```

> The most powerful one. The shape `(accumulator, item) => nextAccumulator` with an initial value lets you build anything: sums, objects, nested arrays, whatever. The other methods are essentially specialized versions of this idea.

---

### `.forEach()`
**Callback receives:** `item, index, array`  
**Callback returns:** void (ignored)  
**Method returns:** `undefined`

```js
[1, 2, 3].forEach(x => console.log(x))
// side effects only
```

---

### `.find()`
**Callback receives:** `item, index, array`  
**Callback returns:** boolean — truthy = this one  
**Method returns:** first match, or `undefined`

```js
[1, 2, 3].find(x => x > 1)
// 2
```

---

### `.findIndex()`
**Callback receives:** `item, index, array`  
**Callback returns:** boolean — truthy = this one  
**Method returns:** first matching index, or `-1`

```js
['cat', 'dog', 'bird'].findIndex(x => x === 'dog')
// 1
```

---

### `.some()`
**Callback receives:** `item, index, array`  
**Callback returns:** boolean  
**Method returns:** `true` if **any** item matches

```js
[1, 2, 3].some(x => x > 2)
// true
```

---

### `.every()`
**Callback receives:** `item, index, array`  
**Callback returns:** boolean  
**Method returns:** `true` if **all** items match

```js
[2, 4, 6].every(x => x % 2 === 0)
// true
```

---

### `.flatMap()`
**Callback receives:** `item, index, array`  
**Callback returns:** value or array  
**Method returns:** new array (map + flat 1 level)

```js
[[1, 2], [3]].flatMap(x => x)
// [1, 2, 3]
```

---

### `.sort()`
**Callback receives:** `a, b`  
**Callback returns:** negative → a first, `0` → equal, positive → b first  
**Method returns:** ⚠️ same array — **mutates!**

```js
[3, 1, 2].sort((a, b) => a - b)
// [1, 2, 3]
```

---

## Non-higher-order array methods

These take no callback — different category, but commonly confused.

### `.reverse()`
**Params:** none  
**Returns:** ⚠️ same array — **mutates!**

```js
[1, 2, 3].reverse()
// [3, 2, 1]
```

---

### `.splice(start, deleteCount, ...items)`
**Params:** index, how many to remove, optional items to insert  
**Returns:** array of removed elements — ⚠️ **mutates!**

```js
const a = [1, 2, 3, 4]
a.splice(1, 2)       // removes 2 items starting at index 1
// returns [2, 3], a is now [1, 4]

a.splice(1, 0, 9)    // insert 9 at index 1, remove nothing
// returns [], a is now [1, 9, 4]
```

---

### `.slice(start, end)` — the "take" equivalent
**Params:** start index (inclusive), end index (exclusive)  
**Returns:** new array — **does not mutate**

```js
[1, 2, 3, 4, 5].slice(0, 3)   // take first 3
// [1, 2, 3]

[1, 2, 3, 4, 5].slice(2)      // from index 2 to end
// [3, 4, 5]

[1, 2, 3, 4, 5].slice(-2)     // last 2
// [4, 5]
```

> `take(n)` from Kotlin/Lodash is just `slice(0, n)` in vanilla JS.