import fs from "node:fs";
import { parse, type ParseError } from 'jsonc-parser';
import type { RawToken } from '@styleTokens/types/compiler.types';

type TokenFile = {
  fullPath: string;
  json: RawToken;
  errors: ParseError[];
}

export default function loadTokenFile(fullPath: string): TokenFile {
  const text = fs.readFileSync(fullPath, 'utf8');

  const errors: ParseError[] = [];
  const json = parse(text, errors);

  return {
    fullPath,
    json,
    errors,
  };
}