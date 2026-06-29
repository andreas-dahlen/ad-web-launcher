import SettingsPanel from '../../panels/SettingsPanel/SettingsPanel.js';
import { Z } from '@config/zIndex.config.js';
import ScrollPrim from '../../primitives/ScrollPrim/ScrollPrim.js';
import css from './Layers.module.css'
import ButtonPrim from '@primitives/ButtonPrim/ButtonPrim.js';
import { settingsStore } from '@stores/settings.store.js';
import clsx from 'clsx';
/** LAYER 3/3! */
export default function OverlayLayer() {

  const panelOpen = settingsStore(s => s.settings.panelOpen)
  const update = settingsStore.getState().update


  return (
    <div className={clsx(css.layer, "center")} style={{ zIndex: Z.overlay }}>
      <ButtonPrim
        id='settings'
        onPressRelease={() => update("panelOpen", !panelOpen)}>settings</ButtonPrim>


      <div className={clsx(css.layer, "center")} style={{ zIndex: Z.overlay }}>
        {panelOpen ? <SettingsPanel /> : ''}


        <ScrollPrim
          id='testing-scroll'
          axis='vertical'
          overflowSide='top'
          isInitialVisible={false}
        >
          <div className='test-frame'></div>
        </ScrollPrim>
      </div>
    </div>
  )
}