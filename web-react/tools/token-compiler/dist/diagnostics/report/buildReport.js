import { presetSection } from './sections/presetSection.js';
import { tokenSection } from './sections/tokenSection.js';
import { variableSection } from './sections/variableSection.js';
import { classSection } from './sections/classSection.js';
import { selectorSection } from './sections/selectorSection.js';
import { fileSection } from './sections/fileSection.js';
import { headerSection } from './sections/headerSection.js';
import { issuesSection } from './sections/issuesSection.js';
import { invalidVarSection } from './sections/invalidVarSection.js';
import { omittedPresetSection } from './sections/omittedPresetSection.js';
export function buildReport(data) {
    const sections = [];
    const header = headerSection(data.processedGroupCount);
    sections.push(header);
    const preset = presetSection(data.generatedFiles.presets);
    if (preset)
        sections.push(preset);
    const omittedPreset = omittedPresetSection(data.omittedPresetFiles);
    if (omittedPreset)
        sections.push(omittedPreset);
    const token = tokenSection(data.generatedFiles.tokens);
    if (token)
        sections.push(token);
    const variableReport = variableSection(data.mismatchedVariables);
    if (variableReport)
        sections.push(variableReport);
    const selectorReport = selectorSection(data.unusableSelectors);
    if (selectorReport)
        sections.push(selectorReport);
    const classReport = classSection(data.missingClasses);
    if (classReport)
        sections.push(classReport);
    const invalidVarReport = invalidVarSection(data.invalidVarDeclarations);
    if (invalidVarReport)
        sections.push(invalidVarReport);
    const fileReport = fileSection(data.missingCssModules);
    if (fileReport)
        sections.push(fileReport);
    const issuesReport = issuesSection(data.issues);
    if (issuesReport)
        sections.push(issuesReport);
    return sections;
}
