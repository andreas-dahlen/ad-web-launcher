import { useDragEnabled } from '@config/settingsHooks/useDragEnabled';
import { useGridEnabled } from '@config/settingsHooks/useGridEnabled';
import DebugItem from '@debug/DebugItem.tsx';
import locked from '@assets/locked.svg?react'
import unlocked from '@assets/unlocked.svg?react'
import grid from '@assets/grid.svg?react'
import Slider from '@components/primitives/slider/Slider';

export default function DebugPanel() {

  const { dragEnabled, setDragEnabled } = useDragEnabled()
  const setLock = () => {
    setDragEnabled(!dragEnabled)
  }
  const { gridEnabled, setGridEnabled } = useGridEnabled()
  const setGrid = () => {
    setGridEnabled(!gridEnabled)
  }

  return (
    <>
      <div className='debug-pannel'>
        <div className='debug-row'>
          <DebugItem
            id='lock-drag-item'
            value={dragEnabled}
            setValue={setLock}
            label={dragEnabled ? 'drag unlocked' : 'drag locked'}
            ReactImg={dragEnabled ? unlocked : locked}>
          </DebugItem>
          <DebugItem
            id='drag-grid'
            value={gridEnabled}
            setValue={setGrid}
            label={gridEnabled ? 'grid enabled' : 'grid disabled'}
            ReactImg={grid}>
          </DebugItem>
        </div >
        <div className='debug-slider-frame'>
          <Slider
            id='snapX-slider'
            axis='horizontal'
            className='debug-slider'
          // onValueChange={onValueChange}
          >

            <div className='slider-base debug-slider-knob'></div>
          </Slider>
          <label>snap X: //valueNumber</label>
        </div>
        <div className='debug-slider-frame'>
          <Slider
            id='snapY-slider'
            axis='horizontal'
            className='debug-slider'
          // onValueChange={onValueChange}
          >

            <div className='slider-base debug-slider-knob'></div>
          </Slider>
          <label>snap Y //valueNumber</label>
        </div>
      </div>
      {/* // </div > */}

    </>
  )
}
{/* <template>
  <div class="settings-panel">
    <h3>App Settings</h3>

    <!-- Drag Lock Toggle -->
    <div class="row">
      <label for="dragLock">Lock Drag Items</label>
      <input type="checkbox" id="dragLock" class="enable-event"
        v-model="USER_SETTINGS.dragLock" />
    </div>
    <div class="row">
      <label for="dragGridVisual">Show Drag Grid</label>
      <input type="checkbox" id="dragGridVisual" class="enable-event"
        v-model="USER_SETTINGS.dragGridVisual" />
    </div>

    <div class="row">change snapping
      <label for="defultSnapX">X</label>
      <select class="enable-event" v-model.number="USER_SETTINGS.defaultSnapX">
      <option v-for="n in 9" :key="n - 1" :value="n - 1">
      {{ n - 1}}
    </option>
  </select>

  <label for="defultSnapY">Y</label>
  <select class="enable-event" v-model.number="USER_SETTINGS.defaultSnapY">
  <option v-for="n in 19" :key="n - 1" :value="n - 1">
  {{ n - 1}}
</option>
            </select >
        </div >

        < !--Debug Panel Toggle(optional)-- >
        < !-- < div class="row" >
            <label for="debugPanel">Show Debug Panel</label>
            <input type="checkbox" id="debugPanel" v-model="USER_SETTINGS.debugPanel" />
        </div > -->

        < !--Add more toggles as needed -->
    </div >
</template > */}