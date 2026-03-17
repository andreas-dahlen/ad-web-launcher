import LaneWallpaper from "./WallpaperLayer.tsx"
import HorizontalLayer from "./HorizontalLayer.tsx"
import InteractiveLayer from "./InteractiveLayer.tsx"
import OverlayLayer from "./OverlayLayer.tsx"

export default function Root() {
  return (
    <>
        <LaneWallpaper />
        <HorizontalLayer />
        <InteractiveLayer />
        <OverlayLayer />
    </>
  )
}