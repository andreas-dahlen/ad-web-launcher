import type { ReportSection } from '@styleTokens/diagnostics/report/buildReport';

export default function headerSection(processedGroupCount: number): ReportSection {
  // const entries: ReportEntry[] = [];

  // entries.push({
  //   title: `processed: (${processedGroupCount})`
  // })
  const lines = `     Processed Modules: (${processedGroupCount}) \n`

  if (processedGroupCount > 1) {
    return {
      title: `✨ [DesignTokens] Initialization complete!`,
      entries: [{ title: "", lines: [lines] }]
    };
  }

  return {
    title: `🔄 [DesignTokens] Update complete!`,
    entries: [{ title: "" }]
  }
}

//