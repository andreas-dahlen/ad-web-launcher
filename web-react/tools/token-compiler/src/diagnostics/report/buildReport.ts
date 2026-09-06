import type { DiagnosticData } from '../../types/diagnostics.types.ts';
import type { CompilerConfig } from '../../types/run.types.ts';

import { headerSection } from './sections/verbose/headerSection.ts';
import { patchesSection } from './sections/verbose/patchesSection.ts';
import { presetSection } from './sections/verbose/presetSection.ts';
import { singleFileSection } from './sections/verbose/singleFileSection.ts';
import { tokenSection } from './sections/verbose/tokenSection.ts';

import { summarySection } from './sections/summary/summarySection.ts';

import { classSection } from './sections/problems/classSection.ts';
import { fileSection } from './sections/problems/fileSection.ts';
import { invalidVarSection } from './sections/problems/invalidVarSection.ts';
import { issuesSection } from './sections/problems/issuesSection.ts';
import { omittedPresetSection } from './sections/problems/omittedPresetSection.ts';
import { selectorSection } from './sections/problems/selectorSection.ts';
import { variableSection } from './sections/problems/variableSection.ts';

export type ReportSection = {
  title: string
  entries: ReportEntry[]
};

export type ReportEntry = {
  title: string
  lines?: string[]
};

export function buildReport(data: DiagnosticData, config: CompilerConfig): ReportSection[] {
  const sections: ReportSection[] = []


  //Emission report
  switch (config.logging.emissions) {
    case "verbose": {
      sections.push(
        headerSection(data.processedGroupCount),
        tokenSection(data.generatedFiles.tokens),
        presetSection(data.generatedFiles.presets),
        singleFileSection(data.generatedFiles, config.outputs),
        patchesSection(data.generatedPatches, config.outputs)
      )
      break
    }
    case "summary": {
      sections.push(summarySection(data, config.outputs))
      break
    }
    case "off": break
  }
  //Diagnostics - always reported
  const omittedPreset = omittedPresetSection(data.omittedPresetFiles)
  if (omittedPreset) sections.push(omittedPreset)
  const variableReport = variableSection(data.mismatchedVariables)
  if (variableReport) sections.push(variableReport)
  const selectorReport = selectorSection(data.unusableSelectors)
  if (selectorReport) sections.push(selectorReport)
  const classReport = classSection(data.missingClasses)
  if (classReport) sections.push(classReport)
  const invalidVarReport = invalidVarSection(data.invalidVarDeclarations)
  if (invalidVarReport) sections.push(invalidVarReport)
  const fileReport = fileSection(data.missingCssModules)
  if (fileReport) sections.push(fileReport)
  const issuesReport = issuesSection(data.issues)
  if (issuesReport) sections.push(issuesReport)

  return sections
}