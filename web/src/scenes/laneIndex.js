import A1 from './top/1A.vue'
import B1 from './top/1B.vue'
import C1 from './top/1C.vue'

import A2 from './mid/2A.vue'
import B2 from './mid/2B.vue'
import C2 from './mid/2C.vue'
// import D2 from './mid/2D.vue'

import A3 from './bottom/3A.vue'
import B3 from './bottom/3B.vue'
import C3 from './bottom/3C.vue'

import A4 from './wallpaper/WallA.vue'
import B4 from './wallpaper/WallB.vue'
import C4 from './wallpaper/WallC.vue'
// import D4 from './wallpaper/WallD.vue'

import TopMir1 from './mirrorLanes/top1.vue'
import TopMir2 from './mirrorLanes/top2.vue'
import TopMir3 from './mirrorLanes/top3.vue'

import MidMir1 from './mirrorLanes/mid1.vue'
import MidMir2 from './mirrorLanes/mid2.vue'
import MidMir3 from './mirrorLanes/mid3.vue'

import BottomMir1 from './mirrorLanes/bottom1.vue'
import BottomMir2 from './mirrorLanes/bottom2.vue'
import BottomMir3 from './mirrorLanes/bottom3.vue'

import WallMir1 from './mirrorLanes/wall1.vue'
import WallMir2 from './mirrorLanes/wall2.vue'
import WallMir3 from './mirrorLanes/wall3.vue'

export const LANES = {
  top: [A1, B1, C1],
  mid: [A2, B2, C2],
  bottom: [A3, B3, C3],
  wallpaper: [A4, B4, C4]
}

export const MIRLANES = {
  top: [TopMir1, TopMir2, TopMir3],
  mid: [MidMir1, MidMir2, MidMir3],
  bottom: [BottomMir1, BottomMir2, BottomMir3],
  wallpaper: [WallMir1, WallMir2, WallMir3]
}