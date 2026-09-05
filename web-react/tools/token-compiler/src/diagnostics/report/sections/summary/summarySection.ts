import { colors, paint } from '../../../../utils/string.ts';
import type { DiagnosticData, FileStatus } from '../../../../types/diagnostics.types.ts';
import type { ReportEntry, ReportSection } from '../../buildReport.ts';
import type { CompilerOutputs } from '../../../../types/run.types.ts';

export function summarySection(data: DiagnosticData, outputs: CompilerOutputs): ReportSection | undefined {
  const entries: ReportEntry[] = [];

  const header = (data.processedGroupCount > 1)
    ? `\n✨ ${paint(`[DesignTokens]`, colors.heading)} ${paint(`Initialization complete!`, colors.value)} (${paint(data.processedGroupCount, colors.value)})`
    : `\n🔄 ${paint(`[DesignTokens]`, colors.heading)} ${paint(`Update complete!`, colors.value)}`

  function getFilesInfo(data: FileStatus, isEnabled: boolean): string {
    if (!isEnabled) return "☠️"
    if (data.written.length > 0) return `${data.written.length}`
    return '⏩'
  }
  function getSingleInfo(data: FileStatus, isEnabled: boolean): string {
    if (!isEnabled) return "☠️"
    if (data.written.length > 0) return `✔️ `
    return '⏩'
  }

  const { presets,
    tokens,
    metadata,
    lsp,
    extension } = data.generatedFiles

  const { css, jsonc } = data.generatedPatches

  entries.push({
    title: `📁 ${paint(`[Preset files]`, colors.heading)} (${paint(getFilesInfo(presets, outputs.presets), colors.value)}) `
  }, {
    title: `🎯 ${paint(`[Token files]`, colors.heading)}  (${paint(getFilesInfo(tokens, outputs.tokens), colors.value)})   `
  }, {
    title: `🧩 ${paint(`[Metadata]`, colors.heading)}     (${paint(getSingleInfo(metadata, outputs.meta), colors.value)} )`
  }, {
    title: `🔌 ${paint(`[Extension]`, colors.heading)}    (${paint(getSingleInfo(extension, outputs.extension), colors.value)})`
  }, {
    title: `🔮 ${paint(`[LSP]`, colors.heading)}          (${paint(getSingleInfo(lsp, outputs.lsp), colors.value)}) `
  }, {
    title: `\n  🩹 ${paint(`[Css patches]`, colors.heading)}  (${paint(getFilesInfo(css, outputs.pathPatches), colors.value)})  `
  }, {
    title: `🩹 ${paint(`[Jsonc patches]`, colors.heading)}(${paint(getFilesInfo(jsonc, outputs.pathPatches), colors.value)})  `
  })

  return {
    title: header,
    entries
  };
}