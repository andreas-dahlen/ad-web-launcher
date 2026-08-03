import type { DiagnosticData } from '../../types/diagnostics.types.ts';
import { presetSection } from './sections/presetSection.ts';
import { tokenSection } from './sections/tokenSection.ts';
import { variableSection } from './sections/variableSection.ts';
import { classSection } from './sections/classSection.ts';
import { selectorSection } from './sections/selectorSection.ts';
import { fileSection } from './sections/fileSection.ts';
import { headerSection } from './sections/headerSection.ts';
import { issuesSection } from './sections/issuesSection.ts';
import { invalidVarSection } from './sections/invalidVarSection.ts';

export type ReportSection = {
  title: string;
  entries: ReportEntry[];
};

export type ReportEntry = {
  title: string;
  lines?: string[];
};

export function buildReport(data: DiagnosticData): ReportSection[] {
  const sections: ReportSection[] = [];

  const header = headerSection(data.processedGroupCount)
  sections.push(header)

  const preset = presetSection(data.generatedFiles.presets)
  if (preset) sections.push(preset)
  const token = tokenSection(data.generatedFiles.tokens)
  if (token) sections.push(token)

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