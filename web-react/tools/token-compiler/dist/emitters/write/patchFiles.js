import fs from 'node:fs';
export function patchFiles(files) {
    const updated = [];
    const skipped = [];
    for (const file of files) {
        if (!fs.existsSync(file.outputFile)) {
            skipped.push(file.outputFile);
            continue;
        }
        const current = fs.readFileSync(file.outputFile, "utf8");
        if (current.startsWith(file.content)) {
            skipped.push(file.outputFile);
            continue;
        }
        const update = `${file.content}\n${current}`;
        fs.writeFileSync(file.outputFile, update);
        updated.push(file.outputFile);
    }
    return { updated, skipped };
}
