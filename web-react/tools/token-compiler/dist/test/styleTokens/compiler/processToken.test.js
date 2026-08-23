import { describe, expect, it } from 'vitest';
import { processToken } from '@styleTokens/compiler/processing/processToken';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { mkdirSync, writeFileSync } from 'node:fs';
describe('[COMPILER]', () => {
    describe('processToken', () => {
        const createTokenFile = (content) => {
            const dir = path.join(tmpdir(), 'style-token-tests');
            mkdirSync(dir, { recursive: true });
            const curpath = path.join(dir, 'button.jsonc');
            writeFileSync(curpath, content);
            return curpath;
        };
        it('processes a valid token', () => {
            const path = createTokenFile(`
      {
        "component": "button",
        "vars": {
          "color": {
            "value": "red"
          }
        }
      }
    `);
            const result = processToken(path);
            expect(result.issues.every(section => section.issues.length === 0)).toBe(true);
            expect(result.token).toMatchObject({
                name: 'button',
                tokenPath: path,
                infix: 'button',
            });
            expect(result.token.vars).toHaveLength(1);
        });
        it('uses component as infix when infix is missing', () => {
            const path = createTokenFile(`
      {
        "component": "button",
        "vars": {}
      }
    `);
            const result = processToken(path);
            expect(result.token.name).toBe('button');
            expect(result.token.infix).toBe('button');
        });
        it('uses provided infix instead of component', () => {
            const path = createTokenFile(`
      {
        "component": "button",
        "infix": "primary",
        "vars": {}
      }
    `);
            const result = processToken(path);
            expect(result.token).toMatchObject({
                name: 'button',
                infix: 'primary',
            });
        });
        it('processes multiple variables', () => {
            const path = createTokenFile(`
      {
        "component": "button",
        "vars": {
          "color": {
            "value": "red"
          },
          "background": {
            "value": "blue"
          }
        }
      }
    `);
            const result = processToken(path);
            expect(result.token.vars).toHaveLength(2);
            expect(result.token.vars.map(variable => variable.name)).toEqual([
                'color',
                'background',
            ]);
        });
        it('throws when token structure is invalid', () => {
            const path = createTokenFile(`
    {
      "component": "",
      "vars": {}
    }
  `);
            expect(() => processToken(path))
                .toThrow('component');
        });
    });
});
