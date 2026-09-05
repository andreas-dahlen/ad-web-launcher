import type { DiagnosticData } from '../../types/diagnostics.types.ts';
import type { CompilerConfig } from '../../types/run.types.ts';
import { presetSection } from './sections/verbose/presetSection.ts';
import { tokenSection } from './sections/verbose/tokenSection.ts';
import { omittedPresetSection } from './sections/verbose/omittedPresetSection.ts';
import { headerSection } from './sections/verbose/headerSection.ts';
import { selectorSection } from './sections/problems/selectorSection.ts';
import { fileSection } from './sections/problems/fileSection.ts';
import { issuesSection } from './sections/problems/issuesSection.ts';
import { invalidVarSection } from './sections/problems/invalidVarSection.ts';
import { classSection } from './sections/problems/classSection.ts';
import { variableSection } from './sections/problems/variableSection.ts';
import { summarySection } from './sections/summary/summarySection.ts';

export type ReportSection = {
  title: string;
  entries: ReportEntry[];
};

export type ReportEntry = {
  title: string;
  lines?: string[];
};

export function buildReport(data: DiagnosticData, config: CompilerConfig): ReportSection[] {
  const sections: ReportSection[] = [];


  //Emission report
  switch (config.logging.emissions) {
    case "verbose": {
      const header = headerSection(data.processedGroupCount)
      sections.push(header)
      const preset = presetSection(data.generatedFiles.presets)
      if (preset) sections.push(preset)
      const omittedPreset = omittedPresetSection(data.omittedPresetFiles)
      if (omittedPreset) sections.push(omittedPreset)
      const token = tokenSection(data.generatedFiles.tokens)
      if (token) sections.push(token)
      //     extension
      // lsp
      // metadata
      // patches
      break;
    }
    case "summary": {
      const summary = summarySection(data, config.outputs)
      if (summary) sections.push(summary)
      //     extension
      // lsp
      // metadata
      // patches
      break;
    }
    case "off": break;
  }
  //Diagnostics - always reported
  const variableReport = variableSection(data.mismatchedVariables)
  if (variableReport) sections.push(variableReport)
  const selectorReport = selectorSection(data.unusableSelectors);
  if (selectorReport) sections.push(selectorReport);
  const classReport = classSection(data.missingClasses)
  if (classReport) sections.push(classReport)
  const invalidVarReport = invalidVarSection(data.invalidVarDeclarations)
  if (invalidVarReport) sections.push(invalidVarReport)
  const fileReport = fileSection(data.missingCssModules)
  if (fileReport) sections.push(fileReport)
  const issuesReport = issuesSection(data.issues)
  if (issuesReport) sections.push(issuesReport)

  return sections;
}