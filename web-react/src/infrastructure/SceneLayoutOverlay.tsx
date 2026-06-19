import clsx from 'clsx';
import systemCss from './System.module.css'
import { useSceneContext } from '@primitives/carousel/hooks/useSceneContext.hook';

export default function SceneLayoutOverlay() {
  const { sceneIdx } = useSceneContext()
  return (
    <div className={clsx(systemCss.sceneconfig)}>

      {/* need to be able to remove this easily... X button basically.. */}


      <p>current: {sceneIdx}</p>

      {/* could have add scene to the right.. (RIGHT ONLY) */}
      {/* need a scene store! */}
      {/* change scene order */}
    </div>
  )
}