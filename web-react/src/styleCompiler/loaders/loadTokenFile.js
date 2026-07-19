import fs from 'fs';
import { parse } from 'jsonc-parser';

export default function loadTokenFile(fullPath) {
  const text = fs.readFileSync(fullPath, 'utf8');

  const errors = [];
  const json = parse(text, errors);

  return {
    fullPath,
    json,
    errors,
  };
}