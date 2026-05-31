import Top1 from '@app/scenes/top/Top1'
import Top2 from '@app/scenes/top/Top2'
import Top3 from '@app/scenes/top/Top3'

import Mid1 from '@app/scenes/mid/Mid1'
import Mid2 from '@app/scenes/mid/Mid2'
import Mid3 from '@app/scenes/mid/Mid3'

import Bottom1 from '@app/scenes/bottom/Bottom1'
import Bottom2 from '@app/scenes/bottom/Bottom2'
import Bottom3 from '@app/scenes/bottom/Bottom3'
import Vert1 from '@app/scenes/vertical/Vert1'
import Vert2 from '@app/scenes/vertical/Vert2'
import Vert3 from '@app/scenes/vertical/Vert3'

import Wp1 from '@app/scenes/wallpapers/Wp1'
import Wp2 from '@app/scenes/wallpapers/Wp2'
import Wp3 from '@app/scenes/wallpapers/Wp3'

const top = [Top1, Top2, Top3]

const mid = [Mid1, Mid2, Mid3]

const bottom = [Bottom1, Bottom2, Bottom3]

const wallPaper = [Wp1, Wp2, Wp3]

const vertical = [Vert1, Vert2, Vert3]

export const lanes = {
  horizontal: { top, mid, bottom },
  wallPaper,
  vertical
}