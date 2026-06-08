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

  const { isLayoutEditMode, isSnapEnabled } = useSettingsStore()

  return (

    <Drag
      id={`${id}-drag`}
      useSettingsSnap={isSnapEnabled}
      interactive={isLayoutEditMode}
      onSwipeCommit={onSwipeCommit}
      dragDataAttrs={dragDataAttrs}
    >
      <Slider
        id={`${id}-slider`}
        axis={axis}
        interactive={!isLayoutEditMode}
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