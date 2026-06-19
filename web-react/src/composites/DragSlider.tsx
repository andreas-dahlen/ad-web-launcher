import Drag from '../primitives/drag/Drag'
import type { DragSliderProps } from '@composites/comp.types'
import { useSettingsStore } from '@hooks/useSettingsStore.hook'
import Slider from '../primitives/slider/Slider'

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

  const { settings } = useSettingsStore()

  return (

    <Drag
      id={`${id}-drag`}
      useSettingsSnap={settings.snapEnabled}
      interactive={settings.dragEnabled}
      onSwipeCommit={onSwipeCommit}
      dragDataAttrs={dragDataAttrs}
    >
      <Slider
        id={`${id}-slider`}
        axis={axis}
        interactive={!settings.dragEnabled}
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