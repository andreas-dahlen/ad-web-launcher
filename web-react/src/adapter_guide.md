
Subscribe to a Reactive
const test = store((s) => s.get('carousel', 'carousel1'))
const index = store((s) => s.get('carousel', 'carousel1')?.data.index)

Add Reactive
store.getState().add({
  type: 'carousel',
  id: 'carousel1',
  data: {
    index: 0,
    count: 5,
    offset: 0,
    size: { x: 300, y: 200 },
    dragging: false,
    settling: false,
    pendingDir: null,
    lockPrevAt: null,
    lockNextAt: null,
    currentScenes: [0, 1, 2],
  }
})

Read Snapshot (without subscribing)
const snapshot = store.getState().get('carousel', 'carousel1')

snapshot contains { type, id, data }.

Remove Reactive
store.getState().remove('carousel', 'carousel1')

Update State Directly
const test = store.getState().get('carousel', 'carousel1')
test.data.dragging = true

Or via a helper function:

function updateCarousel(id: string, fn: (data: CarouselState) => void) {
  const reactive = store.getState().get('carousel', id)
  if (reactive) fn(reactive.data)
}

updateCarousel('carousel1', (data) => {
  data.dragging = true
})

✅ Usage is flat: test.data is the full carousel object.
✅ No nested store inside data — everything lives under data.