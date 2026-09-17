import type { AST } from "jsonc-eslint-parser";

export type ObjectExpression = AST.JSONObjectExpression;
export type Property = AST.JSONProperty;

export type LiteralProperty = AST.JSONProperty & {
  value: AST.JSONLiteral;
};

export type ObjectProperty = AST.JSONProperty & {
  value: AST.JSONObjectExpression;
};

export type ArrayProperty = AST.JSONProperty & {
  value: AST.JSONArrayExpression;
};


export function isJSONProperty(
  property: AST.JSONNode,
): property is Property {
  return property.type === "JSONProperty";
}


export function isLiteralProperty(
  property: AST.JSONNode,
): property is LiteralProperty {
  return (
    property.type === "JSONProperty" &&
    property.value.type === "JSONLiteral"
  );
}


export function isObjectProperty(
  property: AST.JSONNode,
): property is ObjectProperty {
  return (
    property.type === "JSONProperty" &&
    property.value.type === "JSONObjectExpression"
  );
}


export function isArrayProperty(
  property: AST.JSONNode,
): property is ArrayProperty {
  return (
    property.type === "JSONProperty" &&
    property.value.type === "JSONArrayExpression"
  );
}
