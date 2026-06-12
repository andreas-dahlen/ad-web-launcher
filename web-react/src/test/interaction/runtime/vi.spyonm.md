# Create Spy
```js
const spy = vi.spyOn(obj, 'method')
```
 *Observe calls.*


# Fake Return Value
```js
vi.spyOn(obj, 'method')
  .mockReturnValue(value)
```
*Skip real implementation.*


# Fake Implementation
````js
vi.spyOn(obj, 'method')
  .mockImplementation((a, b) => ...)
````
*Custom logic.*


# Assertions Called
```js
expect(spy).toHaveBeenCalled()
```

# Called N Times
```js
expect(spy).toHaveBeenCalledTimes(1)
```

# Called With
```js
expect(spy).toHaveBeenCalledWith(a, b)
```

---
## Flexible Matchers ##
---

# Partial Object
```js
expect.objectContaining({
  event: 'swipeRevert'
})
```

# Any Number
````js
expect.any(Number)
````

# Anything
````js
expect.anything()
````

# Sequential Returns
````js
spy
  .mockReturnValueOnce(a)
  .mockReturnValueOnce(b)
````

# Cleanup
````js
afterEach(() => {
  vi.restoreAllMocks()
})
````
## Most Common Usage ##
```js
const spy = vi.spyOn(obj, 'method')

spy.mockReturnValue(value)

expect(spy).toHaveBeenCalled()

expect(spy).toHaveBeenCalledWith(...)
```