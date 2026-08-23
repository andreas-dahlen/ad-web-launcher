import path from 'node:path';
import Color from 'colorjs.io';
export function assembleLspData(oklchVariables, tokens, outPath) {
    const rgbVariables = new Set();
    for (const [variable, value] of oklchVariables) {
        const color = Color.try(value);
        if (!color)
            continue;
        const rgb = color.to('srgb');
        rgbVariables.add(`${variable}: ${rgb.toString()}`);
    }
    const outputFile = path.join(outPath, "metadata/cssVariables.generated.ts");
    return {
        rgbVariables: [...rgbVariables],
        tokens,
        outputFile
    };
}
