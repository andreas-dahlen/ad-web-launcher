import type { TSESTree } from "@typescript-eslint/utils";
type ObjectExpression = TSESTree.ObjectExpression;
type Property = TSESTree.Property;


function getProperty(
  root: ObjectExpression | undefined,
  name: string,
): Property | undefined {
  return root?.properties?.find(
    (property): property is Property =>
      property.type === "Property" &&
      property.key.type === "Literal" &&
      property.key.value === name
  );
}

export function getArrayProperty(
  objectNode: ObjectExpression,
  name: string,
) {
  const property = getProperty(objectNode, name);

  const elements =
    property?.value.type === "ArrayExpression"
      ? property.value.elements
      : []

  const entries = elements
    .filter((element): element is TSESTree.Expression => element !== null)
    .map(element => ({
      node: element,
      value:
        element.type === "Literal"
          ? element.value
          : undefined,
    }));

  return {
    node: property,
    entries,
    values: entries.map(entry => entry.value)
  };
}

export function getObjectProperty(
  objectNode: ObjectExpression,
  name: string,
) {
  const property = getProperty(objectNode, name);

  const properties =
    property?.value.type === "ObjectExpression"
      ? property.value.properties
      : [];

  const entries = properties
    .filter(
      (property): property is TSESTree.Property =>
        property.type === "Property"
    )
    .map(property => ({
      node: property,
      key:
        property.key.type === "Literal"
          ? String(property.key.value)
          : "",
      value:
        property.value.type === "Literal"
          ? property.value.value
          : undefined,
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
    property?.value.type === "ObjectExpression"
      ? property.value.properties
      : [];

  return variables
    .filter(
      (variable): variable is TSESTree.Property =>
        variable.type === "Property"
    )
    .filter(
      (
        variable,
      ): variable is TSESTree.Property & {
        value: TSESTree.ObjectExpression;
      } =>
        variable.value.type === "ObjectExpression"
    )
    .map(variable => ({
      node: variable,
      name:
        variable.key.type === "Literal"
          ? String(variable.key.value)
          : "",
      value: variable.value,
    }));
}

export function getValueLoc(
  node: TSESTree.Node,
) {
  return {
    start: {
      line: node.loc.start.line,
      column: node.loc.start.column + 2,
    },
    end: {
      line: node.loc.end.line,
      column: node.loc.end.column - 2,
    },
  };
}