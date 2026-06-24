1. The React idea (very simple version)

Imagine a webpage is built from LEGO rooms.

Each room is a component.

Example:

House
 ├── Kitchen
 ├── Bedroom
 └── Counter

When something changes (like the counter number), React rebuilds the room to check what changed.

So React does this:

state changes
→ rebuild component
→ compare new version
→ update the DOM

This rebuilding is called rendering.

2. Hooks (special tools inside components)

Hooks are tools your component can use.

Examples:

useState → remember something

useEffect → run something after rendering

useMemo → remember a calculation

useCallback → remember a function

They are called hooks because they “hook into” React.

3. useState (memory box)

Imagine your component has a little box that stores something.

const [count, setCount] = useState(0)

This means:

box label: count
value inside: 0

If you change it:

setCount(5)

React says:

"Something changed!"
→ rebuild component
4. useEffect (do something after building)

Imagine after building your LEGO room you want to:

turn on the lights

play music

fetch data

That is what useEffect does.

Example:

useEffect(() => {
  console.log("Hello!")
})

React does:

build component
→ run useEffect
5. Dependency arrays (when should effect run?)

Now imagine you only want music to play when the counter changes.

You tell React:

useEffect(() => {
  console.log("Count changed")
}, [count])

The dependency array is:

[count]

That means:

only run effect if count changed

Think of it like:

Watch these things:
[count]

If something inside changes → run effect.

No dependency array
useEffect(() => {})

Runs every render.

Empty dependency array
useEffect(() => {}, [])

Runs only once.

Like:

run when component appears
6. The big React quirk

React re-runs the whole component every render.

Example:

function Counter() {
  console.log("component running")

  return <p>Hello</p>
}

Every state change:

component running
component running
component running

Even if nothing changed.

This is why React needed extra tools.

7. useMemo (remember a calculation)

Imagine you bake a cake.

If the ingredients didn’t change, you don’t want to bake the cake again.

You want to reuse the cake.

That’s what useMemo does.

Example:

const expensiveValue = useMemo(() => {
  return bigCalculation(a, b)
}, [a, b])

Meaning:

if a or b changed
  → calculate again
else
  → reuse old result

So React doesn't redo the expensive work.

8. useCallback (remember a function)

Functions in JavaScript are new every time.

Example:

const handleClick = () => {
  console.log("click")
}

Every render:

new function
new function
new function

Sometimes this causes child components to rerender.

So React gives us useCallback.

Example:

const handleClick = useCallback(() => {
  console.log("click")
}, [])

Meaning:

reuse the same function
until dependencies change
9. memo (don’t rebuild a component)

Imagine a child component:

function Button() {
  console.log("button render")
}

If the parent re-renders:

parent rebuilds
→ button rebuilds too

Even if nothing changed.

memo tells React:

only rebuild this component
if props changed

Example:

const Button = memo(function Button(props) {
  return <button>{props.text}</button>
})

Now React checks:

did props change?
  yes → rerender
  no  → skip
10. Why this confuses people

Because React does this:

rerender everything
→ prevent unnecessary work

So developers add tools:

useMemo

useCallback

memo

To stop React from doing too much work.

That’s why people sometimes say React feels indirect.

11. Why frameworks like Solid feel simpler

Frameworks like:

SolidJS

Svelte

Update only the exact thing that changed, so they don’t need:

useMemo
useCallback
memo
dependency arrays

Which is why people say they feel cleaner.

12. The most important thing to remember

React components are basically:

functions that run again and again

And hooks are tools that help React remember things between runs.

If you want, I can also show you something that suddenly makes all React behavior click in your brain:

The "React is just a giant loop that runs your components again and again" mental model.

Once you see that, everything about hooks suddenly makes sense.


Normal order!
useRef     → state that does NOT trigger rerender (presistant between renders)

useState   → state that triggers rerender

useMemo    → cache a calculation based on change in dependencies!
useCallback → cache a function based on change in dependencies!

useEffect  → side effects after render


Vue	            React
ref()	          useState()
reactive()	    useState()
computed()	    calculate inside render OR useMemo()
watch()	        useEffect()
onMounted()	    useEffect(() => {}, [])
props	          function arguments
slots	          children
v-if	          {cond && <Comp/>}
v-for	          {array.map()}
:style	        style={}