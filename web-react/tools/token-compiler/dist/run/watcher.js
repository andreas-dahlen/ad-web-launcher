import chokidar from 'chokidar';
import { whatChanged } from './resolveChange.js';
export function watch({ rootDir, tokenPath }, compiler) {
    console.log('WATCH ROOT:', rootDir);
    const watcher = chokidar.watch(rootDir, {
        ignoreInitial: true,
    });
    watcher.on('change', filePath => {
        const change = whatChanged(filePath, tokenPath);
        switch (change) {
            case 'CSS':
                compiler.handleCssChange(filePath);
                break;
            case 'TOKEN':
                compiler.handleTokenChange(filePath);
                break;
        }
    });
}
