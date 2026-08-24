import type { AST } from 'jsonc-eslint-parser';
import { isArrayProperty, isJSONProperty, isLiteralProperty, isObjectProperty, type ObjectExpression, type Property } from './typeChecks';

function getProperty(
  root: ObjectExpression | undefined,
  name: string,
): Property | undefined {
  return root?.properties.find(
    (property): property is Property =>
      isJSONProperty(property) &&
      property.key.type === "JSONLiteral" &&
      property.key.value === name
  );
}


export function getArrayProperty(
  objectNode: ObjectExpression,
  name: string,
) {
  const property = getProperty(objectNode, name);

  const elements =
    property && isArrayProperty(property)
      ? property.value.elements
      : [];

  const entries = elements
    .filter(
      (element): element is AST.JSONLiteral =>
        element !== null &&
        element.type === "JSONLiteral"
    )
    .map(element => ({
      node: element,
      value: element.value,
    }));

  return {
    node: property,
    entries,
    values: entries.map(entry => entry.value),
  };
}


export function getObjectProperty(
  objectNode: ObjectExpression,
  name: string,
) {
  const property = getProperty(objectNode, name);

  const properties =
    property && isObjectProperty(property)
      ? property.value.properties
      : [];

  const entries = properties
    .filter(isLiteralProperty)
    .map(property => ({
      node: property.value,
      key:
        property.key.type === "JSONLiteral"
          ? String(property.key.value)
          : "",
      value: property.value.value,
    }));

  return {
    node: property,
    entries,
  };
}


export function getAlwaysAllowed(
  root: ObjectExpression,
) {
  return getArrayProperty(root, "alwaysAllowed");
}


export function getVars(
  root: ObjectExpression,
) {
  const property = getProperty(root, "vars");

  const variables =
    property && isObjectProperty(property)
      ? property.value.properties
      : [];

  return variables
    .filter(isObjectProperty)
    .map(variable => ({
      node: variable,
      key: variable.key,
      name:
        variable.key.type === "JSONLiteral"
          ? String(variable.key.value)
          : "",
      value: variable.value,
    }));
}


export function getValueLoc(
  node: AST.JSONLiteral,
) {
  return {
    start: {
      line: node.loc.start.line,
      column: node.loc.start.column + 1,
    },
    end: {
      line: node.loc.end.line,
      column: node.loc.end.column - 1,
    },
  };
}


export function getKeyLoc(
  node: AST.JSONProperty["key"],
) {
  return {
    start: {
      line: node.loc.start.line,
      column: node.loc.start.column + 1,
    },
    end: {
      line: node.loc.end.line,
      column: node.loc.end.column - 1,
    },
  };
}