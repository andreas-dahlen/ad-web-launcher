long press,
 double tap,
 easier behavioral swapping,
 lane swapping with drag,

 add a list of pointerIds to the gestureStore... what primitive type is being active? global lock, is a new gesture allowed to start?

 add animation to the settings panel fade!

 add a lane effect when dragging a draggable over a lane... maybe a highlight or something. so you can see constraints.

  create adding an image and consider API options or local storage or phone storage options would probably be cleanest.

  create a wide carousel with a lot of images and test performance. Maybe add some optimizations like only rendering the visible images, or using lower-res versions until the image is in view... basically a pick a wallpaper scroller widget.




type LayoutStore = {
  slots: Record<string, string[]>  // sceneId → [widgetId, ...]
  widgets: Record<string, WidgetDef>  // widgetId → { type, props }
  move: (widgetId: string, toScene: string) => void
}
Scenes become dumb slot renderers:
tsxfunction Mid1() {
  const widgets = useLayoutStore(s => s.slots['mid-1'])
  return (
    <div className="scene-root">
      {widgets.map(id => <Widget key={id} id={id} />)}
    </div>
  )
}
The portal handles the visual crossing. The tricky part isn't the rendering — it's the drop target resolution. During cross-scene drag you need to know which scene the pointer is over on commit. Your domQuery.findTargetInDom / elementsFromPoint is actually already built for exactly this kind of hit testing, so that's less work than it sounds.
The other tricky part: the existing drag is constrained to its container. Cross-scene drag needs to temporarily escape that constraint while the portal is active — so the drag system needs to know it's in "free drag" mode vs "contained drag" mode.
Definitely future territory but the architecture you're imagining is sound.