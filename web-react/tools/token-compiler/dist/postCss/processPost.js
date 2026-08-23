import { walkProject } from './resolvers/walkProject.js';
export function processPost({ root, cssPath, mutate = true }) {
    void mutate;
    const postData = walkProject(root, cssPath);
    return postData;
}
