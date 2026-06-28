import DragPrim from '@primitives/DragPrim/DragPrim'
import SliderPrim from '@primitives/SliderPrim/SliderPrim'
import type { DragSliderProps } from '@composites/comp.types'
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

    <DragPrim
      id={`${id}-drag`}
      useSettingsSnap={snapEnabled}
      interactive={dragEnabled}
      onSwipeCommit={onSwipeCommit}
      dragDataAttrs={dragDataAttrs}
    >
      <SliderPrim
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

      </SliderPrim>
    </DragPrim>
  )

}