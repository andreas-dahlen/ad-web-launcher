import LaneWallpaper from "./WallpaperLayer"
import LanesHorizontal from "./HorizontalLayer"
import InteractiveLayer from "./InteractiveLayer"
import OverlayLayer from "./OverlayLayer"

export default function Root() {
  return (
    <>
      <div>hello Root
        <LaneWallpaper />
        <LanesHorizontal />
        <InteractiveLayer />
        <OverlayLayer />
      </div>
    </>
  )
}