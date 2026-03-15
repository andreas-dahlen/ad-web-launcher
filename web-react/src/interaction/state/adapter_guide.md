createStore(obj) → makes any object reactive

.setState(fn) → mutate safely, triggers all subscribers

.useStore(selector) → React hook, triggers rerender when slice changes

.subscribe(fn) → optional, for plain JS usage

getSnapshot() → optional, read the current state outside React


1️⃣ Create a reactive state (in your state file)
import { createStore } from "./adapter"

// Base state object
const sizeObject = { device: { width: 360, height: 640 }, scale: 1 }

// Create reactive store
export const reactiveSize = createStore(sizeObject)

2️⃣ Update state (anywhere, e.g., in response to events)
reactiveSize.setState((s) => {
  s.device.width = window.innerWidth
  s.device.height = window.innerHeight
  s.scale = Math.min(window.innerWidth / 360, window.innerHeight / 640)
})

3️⃣ Use state in React components
import { reactiveSize } from "./state files"

function DebugWrapper() {
  // Pick only what you need
  const { device, scale } = reactiveSize.useStore((s) => ({
    device: s.device,
    scale: s.scale
  }))

  const frameStyle = {
    width: `${device.width}px`,
    height: `${device.height}px`,
    transform: `scale(${scale})`,
    transformOrigin: "center center",
  }

  return <div style={frameStyle}></div>
}

4️⃣ Optional: subscribe outside React

// For non-React parts of your engine
reactiveSize.subscribe((snapshot) => {
  console.log("New size:", snapshot.device, snapshot.scale)
})