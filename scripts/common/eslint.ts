import * as console from 'node:console';
import { stdout } from 'node:process';
import { ESLint } from 'eslint';

export async function lint(): Promise<{ warnings: number; errors: number }> {
    let warnings = 0,
        errors = 0;

    try {
        const eslint = new ESLint();
        const formatter = await eslint.loadFormatter('stylish');

        const lintResults = await eslint.lintFiles('src');

        stdout.write(await formatter.format(lintResults));

        for (const result of lintResults) {
            warnings += result.warningCount;
            errors += result.errorCount;
        }
        return { warnings, errors };
    } catch (error) {
        errors += 1;
        console.error(error);
        return { warnings, errors };
    }
}

export async function fix() {
    try {
        const eslint = new ESLint();
        const formatter = await eslint.loadFormatter('stylish');

        const lintResults = await eslint.lintFiles('src');
        await ESLint.outputFixes(lintResults);

        console.log(formatter.format(lintResults));

        return lintResults.reduce((count, result) => count + result.errorCount + result.warningCount, 0);
    } catch (error) {
        console.error(error);
        return 1;
    }
}
