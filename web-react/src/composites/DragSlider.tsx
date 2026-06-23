import Drag from '../primitives/drag/Drag'
import type { DragSliderProps } from '@composites/comp.types'
import Slider from '../primitives/slider/Slider'
import { settingsStore } from '@stores/settings.store'

export default function DragSlider({
  id,
  axis,
  className,
  children,
  trackClassName,
  thumbClassName,
  sliderDataAttrs,
  dragDataAttrs,
  onSwipeCommit,
  onValueChange
}: DragSliderProps) {


  const snapEnabled = settingsStore(s => s.settings.snapEnabled)
  const dragEnabled = settingsStore(s => s.settings.dragEnabled)

  return (

    <Drag
      id={`${id}-drag`}
      useSettingsSnap={snapEnabled}
      interactive={dragEnabled}
      onSwipeCommit={onSwipeCommit}
      dragDataAttrs={dragDataAttrs}
    >
      <Slider
        id={`${id}-slider`}
        axis={axis}
        interactive={!dragEnabled}
        className={className}
        trackClassName={trackClassName}
        thumbClassName={thumbClassName}
        sliderDataAttrs={sliderDataAttrs}
        onValueChange={onValueChange}
      >
        {children}

      </Slider>
    </Drag>
  )

}