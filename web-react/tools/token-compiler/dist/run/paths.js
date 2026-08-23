import path from 'node:path';
import { findHostProjectRoot } from './findHostProjectRoot.js';
const projectRoot = findHostProjectRoot(import.meta.dirname);
const sourceRoot = path.join(projectRoot, 'src');
const tokenRoot = path.join(sourceRoot, 'styleTokens/tokens');
const outRoot = path.join(sourceRoot, 'styleTokens/generated');
export const paths = {
    getRoot() {
        return sourceRoot;
    },
    getTokenRoot() {
        return tokenRoot;
    },
    getOutRoot() {
        return outRoot;
    }
};
