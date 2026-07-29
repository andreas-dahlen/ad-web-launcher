import type { DiagnosticData } from '../data/buildData.ts';
import buildPresetSection from './formatters/buildPresetSection.ts';
import buildTokenSection from './formatters/buildTokenSection.ts';
import buildVariableSection from './formatters/buildVariableSection.ts';
import buildClassSection from './formatters/buildClassSection.ts';
import buildSelectorSection from './formatters/buildSelecorSection.ts';
import buildFileSection from './formatters/buildFileSection.ts';
import headerSection from './formatters/headerSection.ts';
import buildIssuesSection from './formatters/buildIssuesSection.ts';

export type ReportSection = {
  title: string;
  entries: ReportEntry[];
};

export type ReportEntry = {
  title: string;
  lines?: string[];
};

export default function buildReport(data: DiagnosticData): ReportSection[] {
  const sections: ReportSection[] = [];

  const header = headerSection(data.processedGroupCount)
  sections.push(header)

  const presetSection = buildPresetSection(data.generatedFiles.presets)
  if (presetSection) sections.push(presetSection)
  const tokenSection = buildTokenSection(data.generatedFiles.tokens)
  if (tokenSection) sections.push(tokenSection)

  const variableSection = buildVariableSection(data.mismatchedVariables)
  if (variableSection) sections.push(variableSection)
  const selectorSection = buildSelectorSection(data.unusableSelectors);
  if (selectorSection) sections.push(selectorSection);
  const classSection = buildClassSection(data.missingClasses)
  if (classSection) sections.push(classSection)
  const fileSection = buildFileSection(data.missingCssModules)
  if (fileSection) sections.push(fileSection)
  const issuesSection = buildIssuesSection(data.issues)
  if (issuesSection) sections.push(issuesSection)

  return sections;
}