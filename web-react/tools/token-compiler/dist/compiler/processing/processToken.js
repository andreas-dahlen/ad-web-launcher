import { loadTokenFile } from '../loaders/loadTokenFile.js';
import { assert } from '../../utils/assertions.js';
import { parseToken } from './parseToken.js';
import { createIssueCollector } from '../tracking/issueCollector.js';
export function processToken(fullPath) {
    const { json, errors } = loadTokenFile(fullPath);
    const collector = createIssueCollector();
    assert.token(errors, json, fullPath);
    collector.setSubject("String Parsing");
    collector.scope({ value: json.component, path: fullPath, context: "component" });
    const componentResult = parseToken.identifier(json.component, collector);
    if (json.infix) {
        collector.editScope({ value: json.infix, context: "infix" });
    }
    const infixResult = json.infix
        ? parseToken.identifier(json.infix, collector)
        : componentResult;
    const component = componentResult.name;
    const infix = infixResult.name;
    const alwaysAllowed = json.alwaysAllowed ?? [];
    return {
        token: {
            name: component,
            tokenPath: fullPath,
            infix,
            vars: Object.entries(json.vars ?? {}).map(([key, def]) => {
                assert.variable(key, def, fullPath);
                const variableResult = parseToken.variable(def, key, alwaysAllowed, collector);
                return {
                    ...variableResult.variable,
                };
            })
        },
        issues: collector.flush()
    };
}
