import { prefixLeadingNumber, removeInvalidCharacters, toCamelCase, escapeReservedWord, removeWhitespace, toKebab } from '../../oldSharedUtils/stringFormaters.js';
import { createNullIssueCollector } from '../tracking/issueCollector.js';
import { resolveAllowedPrefixes } from '../resolvers/resolveAllowedPrefixes.js';
export const parseToken = {
    identifier(inputString, collector) {
        let name = inputString;
        const collect = collector ?? createNullIssueCollector();
        const slugName = removeWhitespace(name);
        if (slugName !== name) {
            collect.set({ reason: "removed whitespace", after: slugName });
            name = slugName;
        }
        const camelName = toCamelCase(name);
        if (camelName !== name) {
            collect.set({ reason: "converted to camelCase", after: camelName });
            name = camelName;
        }
        const fixedName = removeInvalidCharacters(name);
        if (fixedName !== name) {
            collect.set({ reason: "modified invalid characters", after: fixedName });
            name = fixedName;
        }
        const leadingName = prefixLeadingNumber(name);
        if (leadingName !== name) {
            collect.set({ reason: "prefix being a number", after: leadingName });
            name = leadingName;
        }
        const escaped = escapeReservedWord(name);
        if (escaped !== name) {
            collect.set({ reason: "reserved word", after: escaped });
            name = escaped;
        }
        if (!name) {
            throw new Error("Identifier was empty after parsing");
        }
        return { name };
    },
    variable(rawVar, key, alwaysAllowed, collector) {
        collector.setSubject("Variable Parsing");
        collector.editScope({ value: key, context: "variable key" });
        const keyResult = parseToken.identifier(key, collector);
        collector.editScope({ value: rawVar.name, context: "variable name" });
        const nameResult = rawVar.name
            ? parseToken.identifier(rawVar.name, collector)
            : keyResult;
        const cssName = toKebab(nameResult.name);
        const allowed = rawVar.allowed ?? [];
        const exclude = rawVar.exclude ?? [];
        const prefixes = resolveAllowedPrefixes(allowed, alwaysAllowed, exclude, collector);
        return {
            variable: {
                key: keyResult.name,
                name: nameResult.name,
                cssName,
                effectiveAllowed: prefixes.effectiveAllowed,
                values: parseToken.values(rawVar.values, collector)
            }
        };
    },
    values(values, collector) {
        collector.editScope({ context: "variable values" });
        return Object.fromEntries(Object.entries(values ?? {})
            .filter(([prefix, value]) => {
            if (prefix === value) {
                collector.set({ reason: "removed self reference", value: prefix });
                return false;
            }
            return true;
        }));
    }
};
