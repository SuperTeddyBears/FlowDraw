import { readdir, writeFile } from 'fs/promises';
import { join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = join(__filename, '..');

const svgDir = join(__dirname, 'src', 'assets', 'diagram-elements');
const outputFile = join(__dirname, 'src', 'svgList.ts');

console.log('Ścieżka do folderu SVG:', svgDir);
console.log('Ścieżka do pliku wyjściowego:', outputFile);

try {
    const files = await readdir(svgDir);
    console.log('Znalezione pliki:', files);

    const svgFiles = files
        .filter(file => file.endsWith('.svg'))
        .map(file => file.replace('.svg', ''));
    console.log('Znalezione pliki SVG:', svgFiles);

    const content = `export const svgFileNames = ${JSON.stringify(svgFiles, null, 2)};\n`;

    await writeFile(outputFile, content);
    console.log('Lista SVG-ów została wygenerowana w src/svgList.ts');
} catch (err) {
    console.error('Błąd podczas odczytu folderu lub zapisywania pliku:', err);
}