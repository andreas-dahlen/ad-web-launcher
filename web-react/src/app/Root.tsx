import ContentLayer from "./layers/ContentLayer.tsx"
import OverlayLayer from "./layers/OverlayLayer.tsx"
import BaseLayer from './layers/BaseLayer.tsx'

export default function Root() {


  return (
    <div className='theme' data-theme="default" >
      <BaseLayer />
      <ContentLayer />
      <OverlayLayer />
    </div>
  )
}