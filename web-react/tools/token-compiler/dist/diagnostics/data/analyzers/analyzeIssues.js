export function analyzeIssues(groups) {
    return groups
        .filter(group => group.issues.length > 0)
        .map(group => {
        const contexts = new Map();
        for (const issue of group.issues) {
            const existing = contexts.get(issue.context);
            if (existing) {
                existing.push(issue);
            }
            else {
                contexts.set(issue.context, [issue]);
            }
        }
        const groupedContexts = [...contexts].map(([context, issues]) => ({
            context,
            issues
        }));
        groupedContexts.sort((a, b) => {
            if (a.context === undefined)
                return 1;
            if (b.context === undefined)
                return -1;
            return 0;
        });
        return {
            subject: group.subject,
            contexts: groupedContexts
        };
    });
}
