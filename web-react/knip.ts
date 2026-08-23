import type { KnipConfig } from "knip";

const config: KnipConfig = {
  project: [
    "src/**/*.{ts,tsx}",
    "plugins/**/*.ts"
  ],

  // ignoreIssues: {

  //   "src/test/**": [""]
  // }

};

export default config;