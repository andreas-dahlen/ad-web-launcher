import WallpaperLayer from "./layers/WallpaperLayer.tsx"
// import HorizontalLayer from ".layers/HorizontalLayer.tsx"
import InteractiveLayer from "./layers/InteractiveLayer.tsx"
// import OverlayLayer from ".layers/OverlayLayer.tsx"

export default function Root() {

  return (
    <div className="scene-root">
        <WallpaperLayer />
        {/* <HorizontalLayer /> */}
        <InteractiveLayer />
         {/* <OverlayLayer /> */}
    </div>
  )
}