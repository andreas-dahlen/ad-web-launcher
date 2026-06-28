import { GearIcon, HouseIcon, ShieldCheckIcon, UserIcon, TrashIcon, RowsPlusBottomIcon, GridNineIcon } from "@phosphor-icons/react";

export const systemIcons = {
  settings: GearIcon,
  home: HouseIcon,
  security: ShieldCheckIcon,
  profile: UserIcon,
  trash: TrashIcon,
  addBottom: RowsPlusBottomIcon,
  GridNineIcon: GridNineIcon,
} as const;

export type SystemIconName = keyof typeof systemIcons;