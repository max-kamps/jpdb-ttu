import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import * as chokidar from 'chokidar';

type ManifestModule = typeof import('../../src/manifest.ts');

export async function writeManifest(engines: string[], manifestPath: string) {
    try {
        const module = (await import(`${path.resolve(manifestPath)}?nocache=${new Date()}`)) as ManifestModule;
        const generateManifest = module.default;
        for (const engine of engines) {
            if (!['gecko', 'chromium'].includes(engine)) {
                throw new Error(`Unsupported engine: ${engine}`);
            }
            const manifest = generateManifest(engine as 'gecko' | 'chromium');
            const destination = `build/${engine}/manifest.json`;
            await fs.mkdir(path.dirname(destination), { recursive: true });
            await fs.writeFile(destination, JSON.stringify(manifest, null, 4));
        }
    } catch (error) {
        console.error('[manifest] Error:', error);
    }
}

export async function watch(engines: string[]) {
    const watcher = chokidar.watch('src/manifest.ts', {
        disableGlobbing: true,
    });

    watcher
        .on('add', async path => {
            console.log(`[manifest] Added file ${path}`);
            await writeManifest(engines, path);
        })
        .on('change', async path => {
            console.log(`[manifest] Changed file ${path}`);
            await writeManifest(engines, path);
        })
        .on('error', error => {
            console.error('[manifest] Error:', error);
        })
        .on('ready', () => {
            console.log('[manifest] Initial scan finished, watching for changes');
        });
}
