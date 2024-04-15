import { createWriteStream } from 'node:fs';
import * as fs from 'node:fs/promises';
import archiver from 'archiver';
import * as eslint from './common/eslint.js';
import * as typescript from './common/typescript.js';
import * as prettier from './common/prettier.js';
import * as resources from './common/resources.js';
import * as manifest from './common/manifest.js';

let engines = process.argv.slice(2);
if (engines.length === 0) engines = ['gecko', 'chromium'];

const packageJson = JSON.parse(await fs.readFile('package.json', 'utf-8'));
const packageName = packageJson.name;
const packageVersion = packageJson.version;

console.log(`Building version ${packageVersion}`);
console.log('Cleaning existing build files...');
await fs.rm('build', { recursive: true, force: true });
await fs.rm('dist', { recursive: true, force: true });

console.log('Formatting source...');
const formatSuccessful = await prettier.format();

console.log('Fixing lint errors...');
const lintErrors = await eslint.fix();

console.log('Generating manifests...');
await manifest.writeManifest(engines, 'src/manifest.ts');
for (const engine of engines) {
    const manifest = JSON.parse(await fs.readFile(`build/${engine}/manifest.json`, 'utf-8'));
    if (packageVersion !== manifest['version']) {
        console.log(
            `Versions in package.json (${packageVersion}) and ${engine} manifest (${manifest['version']}) don't match!`,
        );
        process.exit(1);
    }
}

console.log('Compiling typescript...');
const compileSuccessful = await typescript.compileAll(engines);

console.log('Copying resources...');
await resources.copyAll(engines);

const success = formatSuccessful && lintErrors === 0 && compileSuccessful;
if (!success) {
    console.log('\nCompilation failed! Reasons:');
    if (!formatSuccessful) console.log('- Could not format source code');
    if (lintErrors !== 0) console.log('- Unfixable lint errors are present');
    if (!compileSuccessful) console.log('- Type errors are present');

    process.exit(1);
} else {
    console.log('Compilation successful!');
}

await fs.mkdir('dist');

for (const engine of engines) {
    console.log(`Creating ${engine} output zip...`);
    const outputArchiveStream = createWriteStream(`dist/${packageName}_${packageVersion}_${engine}.zip`);
    const outputArchive = archiver('zip', { zlib: { level: 9 } });
    outputArchive.pipe(outputArchiveStream);
    outputArchive.directory(`build/${engine}`, '');
    outputArchive.finalize();
}

console.log(`Creating source zip...`);
const sourceArchiveStream = createWriteStream(`dist/${packageName}_${packageVersion}_source.zip`);
const sourceArchive = archiver('zip', { zlib: { level: 9 } });
sourceArchive.pipe(sourceArchiveStream);
sourceArchive.directory('dev_types', 'dev_types');
sourceArchive.directory('scripts', 'scripts');
sourceArchive.directory('src', 'src');
sourceArchive.glob('*.md');
sourceArchive.glob('package*.json');
sourceArchive.glob('.*ignore');
sourceArchive.glob('.*rc.json');
sourceArchive.file('tsconfig.json', { name: 'tsconfig.json' });
sourceArchive.finalize();
