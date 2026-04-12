import WallpaperLayer from "./layers/WallpaperLayer.tsx"
import HorizontalLayer from "./layers/HorizontalLayer.tsx"
import ContentLayer from "./layers/ContentLayer.tsx"
import OverlayLayer from "./layers/OverlayLayer.tsx"

export default function Root() {


  return (
    <>
      <WallpaperLayer />
      <HorizontalLayer />
      <ContentLayer />
      <OverlayLayer />
    </>
  )
}