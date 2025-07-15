import { readdir, writeFile } from 'fs/promises';
import { join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = join(__filename, '..');

// Definicje ścieżek
const svgDirUML = join(__dirname, 'src', 'assets', 'diagram-elements', 'UML');
const outputFileUML = join(__dirname, 'src', 'svgListUML.ts');

const svgDirEntityRelationship = join(__dirname, 'src', 'assets', 'diagram-elements', 'Entity-Relationship');
const outputFileEntityRelationship = join(__dirname, 'src', 'svgListEntityRelationship.ts');

const svgDirFlowChart = join(__dirname, 'src', 'assets', 'diagram-elements', 'FlowChart');
const outputFileFlowChart = join(__dirname, 'src', 'svgListFlowChart.ts');

const svgDirNetwork = join(__dirname, 'src', 'assets', 'diagram-elements', 'Network');
const outputFileNetwork = join(__dirname, 'src', 'svgListNetwork.ts');

// Funkcja do generowania listy SVG
async function generateSvgList(svgDir, outputFile, exportName) {
    try {
        const files = await readdir(svgDir);
        const svgFiles = files
            .filter(file => file.endsWith('.svg'))
            .map(file => file.replace('.svg', ''));

        const content = `export const ${exportName} = ${JSON.stringify(svgFiles, null, 2)};\n`;
        await writeFile(outputFile, content);
        console.log(`Lista SVG-ów została wygenerowana w ${outputFile}`);
    } catch (err) {
        console.error(`Błąd dla ${outputFile}:`, err);
    }
}

// Wykonanie dla wszystkich trzech folderów
async function main() {
    await Promise.all([
        generateSvgList(svgDirUML, outputFileUML, 'svgFileNamesUML'),
        generateSvgList(svgDirFlowChart, outputFileFlowChart, 'svgFileNamesFlowChart'),
        generateSvgList(svgDirNetwork, outputFileNetwork, 'svgFileNamesNetwork'),
        generateSvgList(svgDirEntityRelationship, outputFileEntityRelationship, 'svgFileNamesEntityRelationship')
    ]);
}

main().catch(err => console.error('Błąd główny:', err));