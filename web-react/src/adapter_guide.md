// Get a store safely
const sizeState = store.get('sizeState', 'device');
if (sizeState) {
  console.log(sizeState.scaledWidth);
}

// Add or update
store.add('sizeState', 'device', { device, scale: 1, scaledWidth: 1080, scaledHeight: 1920 });

// Ensure store exists
const carousel = store.ensure('carousel', 'carousel1', {
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
});

// Remove
store.remove('carousel', 'carousel1');

// Mutate data

  store.mutateData('drag', id, (s) => {
    s.position.x = pos.x
    s.position.y = pos.y
  })

  // Reactive reactions!
  subscribe.useFull('carousel', id)

  subscribe.usePartial('carousel', id, data => {
    data.type
    data.whatever
  })
