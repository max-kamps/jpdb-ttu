import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import * as console from 'node:console';
import * as chokidar from 'chokidar';

async function* walkDirectory(directory: string): AsyncGenerator<string, undefined, undefined> {
    for await (const entry of await fs.opendir(directory)) {
        const childPath = path.join(directory, entry.name);
        if (entry.isFile()) {
            yield childPath;
        } else if (entry.isDirectory()) {
            yield* walkDirectory(childPath);
        }
    }
}

function getDestPath(engine: string, source: string) {
    return path.join('build', engine, path.relative('src', source));
}

async function copyFile(engines: string[], source: string) {
    for (const engine of engines) {
        const destination = getDestPath(engine, source);
        await fs.mkdir(path.dirname(destination), { recursive: true });
        await fs.copyFile(source, destination);
    }
}

export async function copyAll(engines: string[]) {
    for await (const source of walkDirectory('src')) {
        if (!source.match(/\.tsx?$/)) {
            await copyFile(engines, source);
        }
    }
}

export async function watch(engines: string[]) {
    const watcher = chokidar.watch('src', {
        ignored: /\.tsx?$/,
        disableGlobbing: true,
    });

    watcher
        .on('add', async path => {
            console.log(`[resource] Added file ${path}`);
            await copyFile(engines, path);
        })
        .on('change', async path => {
            console.log(`[resource] Changed file ${path}`);
            await copyFile(engines, path);
        })
        .on('unlink', async path => {
            console.log(`[resource] Removed file ${path}`);
            for (const engine of engines) {
                await fs.rm(getDestPath(engine, path), { force: true });
            }
        })
        .on('addDir', async path => {
            console.log(`[resource] Added directory ${path}`);
            // TODO do we need to do anything here?
            // If a user copies a directory into the src folder, will the 'add' action be triggered for each file?
        })
        .on('unlinkDir', async path => {
            console.log(`[resource] Removed directory ${path}`);
            for (const engine of engines) {
                await fs.rm(getDestPath(engine, path), { recursive: true, force: true });
            }
        })
        .on('error', error => {
            console.error('[resource] Error:', error);
        })
        .on('ready', () => {
            console.log('[resource] Initial scan finished, watching for changes');
        });
}
