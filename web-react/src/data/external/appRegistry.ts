import * as Icons from '@data/icons';

export interface AppRegistryItem {
  label: string;
  iconName: keyof typeof Icons
}

export const appRegistry: Record<string, AppRegistryItem> = {
  "com.google.android.youtube": { label: "YouTube", iconName: "youtube" },
  // "com.android.chrome": { label: "Browser", iconName: "chrome" },
  "com.android.settings": { label: "Settings", iconName: "settings" },
  //   "com.netflix.mediaclient": { label: "Netflix", icon: TelevisionIcon },
  //   "com.mojang.minecraftpe": { label: "Minecraft", icon: GameControllerIcon },
};