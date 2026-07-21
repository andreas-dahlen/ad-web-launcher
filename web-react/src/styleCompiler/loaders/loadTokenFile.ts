import fs from "node:fs";
import { parse, type ParseError } from 'jsonc-parser';
import type { RawComponent } from '../../shared/compilerUtils/compiler.types';

export interface LoadedTokenFile {
  fullPath: string;
  json: RawComponent;
  errors: ParseError[];
}

export default function loadTokenFile(fullPath: string): LoadedTokenFile {
  const text = fs.readFileSync(fullPath, 'utf8');

  const errors: ParseError[] = [];
  const json = parse(text, errors);

  return {
    fullPath,
    json,
    errors,
  };
}