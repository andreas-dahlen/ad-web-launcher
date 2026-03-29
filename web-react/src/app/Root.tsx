import WallpaperLayer from "./layers/WallpaperLayer.tsx"
// import HorizontalLayer from "./layers/HorizontalLayer.tsx"
// import InteractiveLayer from "./layers/InteractiveLayer.tsx"
// import OverlayLayer from ".layers/OverlayLayer.tsx"

export default function Root() {

  // export const RenderMapRoot = () => {
  // Sort by layer + optional overrideZ

  // return (

  return (
    <>
      <div className="scene-root">
        <WallpaperLayer />
        {/* <HorizontalLayer /> */}
        {/* <InteractiveLayer /> */}
        {/* <OverlayLayer /> */}
        {/* //   <div id="interactiveLayer" style={{ position: "relative", zIndex: 200 }} />
    //   <div id="overlayLayer" style={{ position: "relative", zIndex: 300 }} /> */}

      </div>
    </>

  )
}