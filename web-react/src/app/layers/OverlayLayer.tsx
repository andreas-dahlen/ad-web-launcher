import SettingsPanel from '../../panels/SettingsPanel/SettingsPanel.ts';
import { Z } from '@config/zIndex.config.ts';
import ScrollPrim from '../../primitives/Scroll/ScrollPrim.tsx';
import css from './Layers.module.css'
import ButtonPrim from '@primitives/Button/ButtonPrim.tsx';
import { settingsStore } from '@stores/settings.store.ts';
import clsx from 'clsx';
/** LAYER 3/4! */
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
          <div></div>
        </ScrollPrim>
      </div>
    </div>
  )
}