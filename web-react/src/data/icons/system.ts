import { GearIcon, HouseIcon, ShieldCheckIcon, UserIcon, TrashIcon, RowsPlusBottomIcon, GridNineIcon, BackspaceIcon, ControlIcon, CaretDownIcon } from "@phosphor-icons/react";
import BombIcon from '@assets/system/BombIcon.svg?react'
import ExitIcon from '@assets/system/ExitIcon.svg?react'
import GridIcon from '@assets/system/GridIcon.svg?react'
import DragLockedIcon from '@assets/system/DragLockedIcon.svg?react'
import DragUnlockedIcon from '@assets/system/DragUnlockedIcon.svg?react'
import LockNextIcon from '@assets/system/LockNextIcon.svg?react'
import LockPrevIcon from '@assets/system/LockPrevIcon.svg?react'
import SnapIcon from '@assets/system/SnapIcon.svg?react'
import ManagerOnHIcon from '@assets/system/ManagerOnHIcon.svg?react'
import ManagerOffHIcon from '@assets/system/ManagerOffHIcon.svg?react'
import ManagerOnVIcon from '@assets/system/ManagerOnVIcon.svg?react'
import ManagerOffVIcon from '@assets/system/ManagerOffVIcon.svg?react'


const local = {
  bomb: BombIcon,
  exit: ExitIcon,
  grid: GridIcon,

  draglocked: DragLockedIcon,
  dragUnlocked: DragUnlockedIcon,
  locknextat: LockNextIcon,
  lockprevat: LockPrevIcon,
  snap: SnapIcon,

  managerOnH: ManagerOnHIcon,
  managerOffH: ManagerOffHIcon,
  managerOnV: ManagerOnVIcon,
  managerOffV: ManagerOffVIcon
}

const phosphor = {
  settings: GearIcon,
  home: HouseIcon,
  security: ShieldCheckIcon,
  profile: UserIcon,
  trash: TrashIcon,
  addBottom: RowsPlusBottomIcon,
  gridNine: GridNineIcon,
  backspace: BackspaceIcon,
  control: ControlIcon,
  caretDown: CaretDownIcon
} as const;

export const system = {
  ...phosphor,
  ...local
}