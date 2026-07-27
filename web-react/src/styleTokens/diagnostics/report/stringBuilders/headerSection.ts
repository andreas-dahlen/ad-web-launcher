import type { ReportSection } from '@styleTokens/diagnostics/report/buildReport';

export default function headerSection(): ReportSection {

  return {
    title: `\n ✨ [DesignTokens] Run complete!`,
    entries: [{ title: "" }]
  };
}
