import { assembleTokenData } from './assemblers/assembleTokenData.js';
import { assemblePresetData } from './assemblers/assemblePresetData.js';
import { assembleLspData } from './assemblers/assembleLspData.js';
import { assembleMetadata } from './assemblers/assembleMetadata.js';
import { assembleExtensionData } from './assemblers/assembleExtensionData.js';
export function extractData(cache, run) {
    const presetFiles = [];
    const tokenFiles = [];
    const tokenData = [];
    const metadata = [];
    const omittedPresetFiles = new Set();
    const groups = cache.getCssDataGroups();
    const runGroups = cache.getCssDataGroupsByPaths(run.getProcessedPaths());
    const postData = cache.getAllPostData();
    const config = cache.getConfig();
    /*---------------------------------------
          all groups
    -------------------------------------*/
    for (const group of groups) {
        const tokenResult = assembleTokenData(group, config.outPath);
        if (tokenResult)
            tokenData.push(tokenResult);
        const metaResult = assembleMetadata(group, config.outPath);
        if (metaResult)
            metadata.push(metaResult);
    }
    /*---------------------------------------
            current run
    -------------------------------------*/
    for (const runGroup of runGroups) {
        const tokenFile = tokenData.find(data => data.groupPath === runGroup.groupPath);
        if (tokenFile) {
            tokenFiles.push(tokenFile);
        }
        const presetResult = assemblePresetData(runGroup.cssData, config.outPath);
        if (presetResult) {
            presetFiles.push(presetResult);
        }
        else {
            omittedPresetFiles.add(runGroup.cssPath);
        }
    }
    /*---------------------------------------
      Final processing
    -------------------------------------*/
    const extensionData = assembleExtensionData(postData.flatMap(t => t.variables), tokenData.flatMap(t => t.tokens), config.outPath);
    const lspData = assembleLspData(postData.flatMap(t => t.oklchVariables), tokenData.flatMap(t => t.tokens), config.outPath);
    return {
        outputData: {
            presetFiles,
            tokenFiles,
            metadata,
            extensionData,
            lspData
        },
        extractResult: {
            omittedPresetFiles: [...omittedPresetFiles]
        }
    };
}
