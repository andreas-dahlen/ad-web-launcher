
const mockMetaCarouselEl = {
  id: 'test',
  axis: 'horizontal',
  type: 'carousel',
  lockNextAt: '3',
  lockPrevAt: '0',
}

const mockMetaDragEl = {
  id: 'test',
  axis: 'both',
  type: 'drag',
  snapX: '10',
  snapY: '20',
}

const mockMetaSliderEl = {
  id: 'test',
  axis: 'horizontal',
  type: 'slider',
  instantSwipe: 'true'
}

const mockMetaScrollEl = {
  id: 'test',
  axis: 'vertical',
  type: 'scroll',
  onEdgeDir: 'left',
  instantSwipe: 'true',
}

const mockMetaButtonEl = {
  id: 'test',
  type: 'button'
}

const mockMetaDefaultEl = {
  id: 'test',
  type: 'carousel',
  axis: 'horizontal',
}
export const mockMetaByType = {
  carousel: mockMetaCarouselEl,
  drag: mockMetaDragEl,
  slider: mockMetaSliderEl,
  scroll: mockMetaScrollEl,
  button: mockMetaButtonEl,
  default: mockMetaDefaultEl
} as const