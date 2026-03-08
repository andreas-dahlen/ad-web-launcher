import A1 from './top/1A.vue'
import B1 from './top/1B.vue'
import C1 from './top/1C.vue'

import A2 from './mid/2A.vue'
import B2 from './mid/2B.vue'
import C2 from './mid/2C.vue'

import A3 from './bottom/3A.vue'
import B3 from './bottom/3B.vue'
import C3 from './bottom/3C.vue'

import A4 from './wallpaper/WallA.vue'
import B4 from './wallpaper/WallB.vue'
import C4 from './wallpaper/WallC.vue'

import TopMir1 from './mirrorLanes/Top1.vue'
import TopMir2 from './mirrorLanes/Top2.vue'
import TopMir3 from './mirrorLanes/Top3.vue'

import MidMir1 from './mirrorLanes/Mid1.vue'
import MidMir2 from './mirrorLanes/Mid2.vue'
import MidMir3 from './mirrorLanes/Mid3.vue'

import BottomMir1 from './mirrorLanes/Bottom1.vue'
import BottomMir2 from './mirrorLanes/Bottom2.vue'
import BottomMir3 from './mirrorLanes/Bottom3.vue'

import WallMir1 from './mirrorLanes/Wall1.vue'
import WallMir2 from './mirrorLanes/Wall2.vue'
import WallMir3 from './mirrorLanes/Wall3.vue'

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

// export const LANES = {
//   wallpaper: [
//     { id: 'wall-1', component: A4 },
//     { id: 'wall-2', component: B4 },
//     { id: 'wall-3', component: C4 }
//   ],
//   top: [
//     { id: 'top-1', component: A1 },
//     { id: 'top-2', component: B1 },
//     { id: 'top-3', component: C1 }
//   ],
//   mid: [
//     { id: 'mid-1', component: A2 },
//     { id: 'mid-2', component: B2 },
//     { id: 'mid-3', component: C2 }
//   ],
//   bottom: [
//     { id: 'bottom-1', component: A3 },
//     { id: 'bottom-2', component: B3 },
//     { id: 'bottom-3', component: C3 }
//   ]
// }
// export const MIRLANES = {
//   wallpaper: [
//     { id: 'mir-wall-1', component: A4 },
//     { id: 'mir-wall-2', component: B4 },
//     { id: 'wall-3', component: C4 }
//   ],
//   top: [
//     { id: 'mir-top-1', component: TopMir1 },
//     { id: 'mir-top-2', component: B1 },
//     { id: 'mir-top-3', component: C1 }
//   ],
//   mid: [
//     { id: 'mir-mid-1', component: A2 },
//     { id: 'mir-mid-2', component: B2 },
//     { id: 'mir-mid-3', component: C2 }
//   ],
//   bottom: [
//     { id: 'mir-bottom-1', component: A3 },
//     { id: 'mir-bottom-2', component: B3 },
//     { id: 'mir-bottom-3', component: C3 }
//   ]
// }