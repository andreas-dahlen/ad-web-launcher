import fs from 'node:fs';
import path from 'node:path';
export function findHostProjectRoot(startDir) {
    let currentDir = path.resolve(startDir);
    let packageJsonCount = 0;
    while (true) {
        const packageJson = path.join(currentDir, 'package.json');
        if (fs.existsSync(packageJson)) {
            packageJsonCount++;
            if (packageJsonCount === 2) {
                return currentDir;
            }
        }
        const parentDir = path.dirname(currentDir);
        if (parentDir === currentDir) {
            break;
        }
        currentDir = parentDir;
    }
    throw new Error('Could not find host project root');
}
