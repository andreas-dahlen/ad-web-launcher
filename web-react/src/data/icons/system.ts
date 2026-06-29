import { GearIcon, HouseIcon, ShieldCheckIcon, UserIcon, TrashIcon, RowsPlusBottomIcon, GridNineIcon, BackspaceIcon } from "@phosphor-icons/react";

export const systemIcons = {
  settings: GearIcon,
  home: HouseIcon,
  security: ShieldCheckIcon,
  profile: UserIcon,
  trash: TrashIcon,
  addBottom: RowsPlusBottomIcon,
  GridNineIcon: GridNineIcon,
  BackspaceIcon: BackspaceIcon
} as const;

export type SystemIconName = keyof typeof systemIcons;