import { TelevisionIcon, GlobeIcon, GearIcon, YoutubeLogoIcon, GameControllerIcon, type Icon } from "@phosphor-icons/react";

export interface AppRegistryItem {
  label: string;
  icon: Icon;
}

export const appRegistry: Record<string, AppRegistryItem> = {
  "com.google.android.youtube": { label: "YouTube", icon: YoutubeLogoIcon },
  "com.android.settings": { label: "Settings", icon: GearIcon },
  "com.android.chrome": { label: "Browser", icon: GlobeIcon },
  "com.netflix.mediaclient": { label: "Netflix", icon: TelevisionIcon },
  "com.mojang.minecraftpe": { label: "Minecraft", icon: GameControllerIcon },
};