import { extractGroupName } from '../resolvers/extractGroupName.js';
import fs from "node:fs";
import path from "node:path";
export function createModuleMap(rootPath, groupPaths) {
    const cssPaths = findCssModules(rootPath); //TODO make it safer? might resolve incorrectly? needs robustness?
    const cssMap = new Map();
    for (const groupPath of groupPaths) {
        const cssPath = resolveCssFromGroup(groupPath, cssPaths);
        if (cssPath) {
            cssMap.set(groupPath, cssPath);
        }
    }
    return cssMap;
}
function findCssModules(dir) {
    const result = [];
    const entries = fs.readdirSync(dir, {
        withFileTypes: true,
    });
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            result.push(...findCssModules(fullPath));
            continue;
        }
        if (entry.isFile() &&
            entry.name.endsWith(".module.css")) {
            result.push(fullPath);
        }
    }
    return result;
}
function resolveCssFromGroup(groupPath, cssPaths) {
    const groupName = extractGroupName(groupPath).toLowerCase();
    return cssPaths.find(cssPath => path.basename(cssPath, ".module.css").toLowerCase() === groupName);
}
