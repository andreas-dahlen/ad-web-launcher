import { assert } from '../../utils/assertions.js';
// In-memory compiler snapshot.
// Built from token sources at startup and updated when token files change.
export function createTokenCache(initialGroups, config) {
    const tokenGroups = new Set();
    const groupByTokenPath = new Map();
    const groupByCssPath = new Map();
    const postData = new Map();
    function addGroup(group) {
        tokenGroups.add(group);
        for (const token of group.tokens) {
            groupByTokenPath.set(token.tokenPath, group);
        }
        if (!group.cssPath)
            return;
        assert.hasCssPath(group);
        groupByCssPath.set(group.cssPath, group);
    }
    function removeGroup(group) {
        tokenGroups.delete(group);
        for (const token of group.tokens) {
            groupByTokenPath.delete(token.tokenPath);
        }
        if (!group.cssPath)
            return;
        groupByCssPath.delete(group.cssPath);
    }
    for (const group of initialGroups) {
        addGroup(group);
    }
    return {
        addGroup,
        removeGroup,
        addCssData(cssData) {
            const group = groupByCssPath.get(cssData.cssPath);
            if (!group)
                return;
            group.cssData = cssData;
        },
        addPostData(data) {
            postData.set(data.cssPath, data);
        },
        getConfig() {
            return config;
        },
        getMissingCssGroupPaths() {
            return [...tokenGroups]
                .filter(group => !group.cssPath)
                .map(group => group.groupPath);
        },
        getAllPostData() {
            // eslint-disable-next-line unicorn/prefer-iterator-to-array
            return [...postData.values()];
        },
        getCssPaths() {
            // eslint-disable-next-line unicorn/prefer-iterator-to-array
            return [...groupByCssPath.keys()];
        },
        getGroupByTokenPath(tokenPath) {
            return groupByTokenPath.get(tokenPath);
        },
        getGroupByCssPath(cssPath) {
            return groupByCssPath.get(cssPath);
        },
        getCssDataGroups() {
            // eslint-disable-next-line unicorn/prefer-iterator-to-array
            const groups = [...groupByCssPath.values()];
            assert.groupsHaveCssData(groups);
            return groups;
        },
        getCssDataGroupsByPaths(paths) {
            return this.getCssDataGroups().filter(group => paths.includes(group.cssPath));
        }
    };
}
