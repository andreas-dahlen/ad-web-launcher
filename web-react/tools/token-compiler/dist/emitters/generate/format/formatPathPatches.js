export function formatPathPatches(metadata) {
    const files = [];
    const basePath = "file://wsl.localhost/Ubuntu";
    for (const data of metadata) {
        const cssFile = `${basePath}${data.cssFile}`;
        for (const tokenPath of data.tokenFiles) {
            if (!tokenPath.endsWith(".jsonc"))
                continue;
            files.push({
                outputFile: tokenPath,
                content: createFileComment(cssFile, "jsonc")
            });
        }
        if (!data.cssFile.endsWith(".css"))
            continue;
        const tokenPaths = data.tokenFiles
            .map(file => `${basePath}${file}`).join("\n");
        files.push({
            outputFile: data.cssFile,
            content: createFileComment(tokenPaths, "css")
        });
    }
    return files;
}
function createFileComment(file, type) {
    return type === "css"
        ? `/* \n${file}\n*/`
        : `// ${file}`;
}
