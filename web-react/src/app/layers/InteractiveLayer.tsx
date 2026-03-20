import MirrorCarousel from "@carousel/MirrorWrapper.tsx"

export default function InteractiveLayer() {

  return (
    <>
      <MirrorCarousel
        id="wallpaper"
        axis="vertical"
        index={1}
      >


        <div className='spin-box mirror-carousel'></div>
      </MirrorCarousel>
    </>
  )
}