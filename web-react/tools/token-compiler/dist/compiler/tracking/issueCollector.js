export function createIssueCollector() {
    const groups = new Map();
    let currentScope = {};
    let subject;
    function setSubject(addedSubject) {
        subject = addedSubject;
        ensureCurrentGroup();
    }
    function scope(init) {
        currentScope = init;
    }
    function ensureCurrentGroup() {
        if (!subject)
            throw new Error("setSubject() must be called before set()");
        let group = groups.get(subject);
        if (!group) {
            group = {
                subject,
                issues: []
            };
            groups.set(subject, group);
        }
        return group;
    }
    function set(issue) {
        const group = ensureCurrentGroup();
        const { path, value, context } = currentScope;
        if (!path || !value) {
            throw new Error("scope() must initialize path and value");
        }
        group.issues.push({
            path,
            value,
            context,
            ...issue
        });
    }
    function editScope(edit) {
        currentScope = {
            path: edit.path ?? currentScope.path,
            value: edit.value ?? currentScope.value,
            context: edit.context ?? currentScope.context
        };
    }
    function flush() {
        // eslint-disable-next-line unicorn/prefer-iterator-to-array
        const result = [...groups.values()];
        groups.clear();
        currentScope = {};
        subject = undefined;
        return result;
    }
    return {
        setSubject,
        scope,
        editScope,
        set,
        flush
    };
}
export function mergeIssueGroups(groups) {
    const merged = new Map();
    for (const group of groups) {
        const existing = merged.get(group.subject);
        if (existing) {
            existing.issues.push(...group.issues);
        }
        else {
            merged.set(group.subject, {
                subject: group.subject,
                issues: [...group.issues]
            });
        }
    }
    // eslint-disable-next-line unicorn/prefer-iterator-to-array
    return [...merged.values()];
}
const nullIssueCollector = {
    setSubject() { },
    set() { },
    scope() { },
    editScope() { },
    flush() { return []; },
};
export function createNullIssueCollector() {
    return nullIssueCollector;
}
