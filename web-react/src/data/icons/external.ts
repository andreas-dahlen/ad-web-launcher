
import { YoutubeLogoIcon, GlobeIcon, TelevisionIcon, GameControllerIcon, PhoneCallIcon } from "@phosphor-icons/react";

const local = {
  phone: PhoneCallIcon, //TODO placeholder for custom
} as const

const phosphor = {
  youtube: YoutubeLogoIcon,
  chrome: GlobeIcon,
  netflix: TelevisionIcon,
  minecraft: GameControllerIcon,
} as const;

export const external = {
  ...phosphor,
  ...local
} as const