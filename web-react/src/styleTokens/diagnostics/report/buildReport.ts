import buildClassSection from './stringBuilders/buildClassSection.ts';
import type { DiagnosticSnapshot } from '../diagnosticService.ts';
import buildVariableSection from './stringBuilders/buildVariableSection.ts';

type Report = {
  sections: ReportSection[]
}

export type ReportSection = {
  title: string;
  entries: ReportEntry[];
};

export type ReportEntry = {
  title: string;
  lines: string[];
};

export default function buildReport(snapshot: DiagnosticSnapshot): Report {
  const sections: ReportSection[] = [];

  const variables = buildVariableSection(snapshot);
  if (variables) sections.push(variables);
  const selectors = buildClassSection(snapshot)
  if (selectors) sections.push(selectors)

  return { sections };
}