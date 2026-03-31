import type { RuntimeBase, RuntimeCarousel, RuntimeDrag, RuntimeSlider } from '@interaction/types/ctx';
import type { CarouselMeta, DragMeta, SliderMeta, ButtonMeta } from '@interaction/types/meta';


export type Descriptor =
  | { type: 'carousel'; meta: Readonly<CarouselMeta>; ctx: RuntimeCarousel }
  | { type: 'slider'; meta: Readonly<SliderMeta>; ctx: RuntimeSlider }
  | { type: 'drag'; meta: Readonly<DragMeta>; ctx: RuntimeDrag }
  | { type: 'button'; meta: Readonly<ButtonMeta>; ctx: RuntimeBase }