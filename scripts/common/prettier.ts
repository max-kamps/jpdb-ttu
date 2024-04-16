import { promisify } from 'node:util';
import { stdout } from 'node:process';
import * as childProcess from 'child_process';
const exec = promisify(childProcess.exec);

// prettier API is very lacking, we'll just call the CLI directly

function countWarningsAndErrors(output: string): { warnings: number; errors: number } {
    const warnings = output.match(/^\[warn\] /gm)?.length ?? 0;
    const errors = output.match(/^\[error\] /gm)?.length ?? 0;
    return { warnings, errors };
}

export async function check(): Promise<{ warnings: number; errors: number }> {
    try {
        const streams = await exec('npx prettier -c .');
        stdout.write(streams.stderr);
        return countWarningsAndErrors(streams.stderr);
    } catch (error: any) {
        stdout.write(error.stderr);
        return countWarningsAndErrors(error.stderr);
    }
}

export async function format() {
    try {
        const out = await exec('npx prettier -w .');
        stdout.write(out.stderr);
        return true;
    } catch (error: any) {
        stdout.write(error.stderr);
        return false;
    }
}
