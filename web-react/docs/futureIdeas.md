evaluate merge protection for data attributes, so that we can merge the buttonDataAttrs with the internalState without overwriting any existing attributes?
const mergedAttrs = {
  ...buttonDataAttrs,
  'data-state': internalState
} **


long press, (yes)
 double tap (future)
 easier behavioral swapping (not sure)
 lane swapping with drag (leaning no)

 multiple pointer support for multi-touch gestures (feels like no)

 drag element boarder tracking => 
 triggering lane swapping, 
 drag and drop between scenes.(HELL YEAH just.. how xD advanced refractor)

 add wallpaper from URL (HELL YEAH)

 consider storage options for wallpapers, button positions everything... consider placeholder storage before moving on to storing in phone storage (HELL YEAH)

  create a wide carousel with a lot of images and test performance. Maybe add some optimizations like only rendering the visible images, or using lower-res versions until the image is in view... basically a pick a wallpaper scroller widget.
  (SOUNDS FUN!)

  need widget handler. Should the user have the ability to add any primitive? probably not... but add composite widgets like a wallpaper scroller, or a button scroller, or a text scroller. (HELL YEAH)