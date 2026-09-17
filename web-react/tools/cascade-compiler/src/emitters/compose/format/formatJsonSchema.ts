import type { FormatFileResult } from '../../../types/emitter.types.ts';

export function formatJsonSchema(
  jsonSchema: string,
): FormatFileResult {

  const outputFile = "metadata/cascade.schema.json"

  return { outputFile, content: jsonSchema, kind: "extension" };
}