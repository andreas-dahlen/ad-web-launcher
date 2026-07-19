function getProperty(root, name) {
  return root?.properties?.find(
    property => property.key.value === name
  );
}


export function getArrayProperty(objectNode, name) {
  const property = getProperty(objectNode, name);

  const entries = (property?.value.elements ?? []).map(element => ({
    node: element,
    value: element.value
  }));

  return {
    node: property,
    entries,
    values: entries.map(entry => entry.value)
  };
}

export function getObjectProperty(objectNode, name) {
  const property = getProperty(objectNode, name);

  const entries = (property?.value.properties ?? []).map(property => ({
    node: property,
    key: property.key.value,
    value: property.value.value
  }));

  return {
    node: property,
    entries
  };
}


export function getAlwaysAllowed(root) {
  return getArrayProperty(root, "alwaysAllowed");
}


export function getVars(root) {
  const property = getProperty(root, "vars");

  const variables = property?.value.properties ?? [];

  return variables.map(variable => ({
    node: variable,
    name: variable.key.value,
    value: variable.value
  }));
}

export function getValueLoc(node) {
  return {
    start: {
      line: node.loc.start.line,
      column: node.loc.start.column + 2
    },
    end: {
      line: node.loc.end.line,
      column: node.loc.end.column - 2
    }
  };
}