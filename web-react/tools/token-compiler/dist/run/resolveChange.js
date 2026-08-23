import path from 'node:path';
export function whatChanged(filePath, tokenPath) {
    if (isCssFile(filePath)) {
        console.log('CSS:', filePath);
        return 'CSS';
    }
    if (isTokenFile(filePath, tokenPath)) {
        console.log('TOKEN:', filePath);
        return 'TOKEN';
    }
    return null;
}
function isTokenFile(filePath, tokenPath) {
    const relative = path.relative(tokenPath, filePath);
    return (!relative.startsWith('..') &&
        !path.isAbsolute(relative) &&
        (filePath.endsWith('.json') || filePath.endsWith('.jsonc')));
}
function isCssFile(filePath) {
    return filePath.endsWith(".css");
}
