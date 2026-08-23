
const metaCarouselSeed = {
  id: 'test',
  axis: 'horizontal',
  type: 'carousel',
  lockNextAt: '3',
  lockPrevAt: '0',
}

const metaDragSeed = {
  id: 'test',
  axis: 'both',
  type: 'drag',
  snapX: '10',
  snapY: '20',
}

const metaSliderSeed = {
  id: 'test',
  axis: 'horizontal',
  type: 'slider',
  instantSwipe: 'true'
}

const metaScrollSeed = {
  id: 'test',
  axis: 'vertical',
  type: 'scroll',
  overflowSide: 'left',
  instantSwipe: 'true',
}

const metaButtonSeed = {
  id: 'test',
  type: 'button'
}

const metaDefaultSeed = {
  id: 'test',
  type: 'carousel',
  axis: 'horizontal',
}
export const metaSeedByType = {
  carousel: metaCarouselSeed,
  drag: metaDragSeed,
  slider: metaSliderSeed,
  scroll: metaScrollSeed,
  button: metaButtonSeed,
  default: metaDefaultSeed
} as const