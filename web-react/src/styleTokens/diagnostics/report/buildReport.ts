import type { DiagnosticData } from '../data/buildData.ts';
import buildVariableSection from './stringBuilders/buildVariableSection.ts';
import buildClassSection from './stringBuilders/buildClassSection.ts';
import buildSelectorSection from './stringBuilders/buildSelecorSection.ts';
import buildFileSection from './stringBuilders/buildFileSection.ts';
import headerSection from './stringBuilders/headerSection.ts';

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

  const header = headerSection()
  sections.push(header)
  const variableSection = buildVariableSection(data.mismatchedVariables)
  if (variableSection) sections.push(variableSection)
  const selectorSection = buildSelectorSection(data.unusableSelectors);
  if (selectorSection) sections.push(selectorSection);
  const classSection = buildClassSection(data.missingClasses)
  if (classSection) sections.push(classSection)
  const fileSection = buildFileSection(data.missingCssModules)
  if (fileSection) sections.push(fileSection)

  return sections;
}