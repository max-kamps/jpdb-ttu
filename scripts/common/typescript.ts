import * as path from 'node:path';
import ts from 'typescript';
import { rewriteImportsTransform, removeAnnoyingDefaultExportTransform } from '../transformers/content_script.js';

const diagnosticHost: ts.FormatDiagnosticsHost = {
    getCanonicalFileName: (path: string) => path,
    getCurrentDirectory: ts.sys.getCurrentDirectory,
    getNewLine: () => ts.sys.newLine,
};

function reportDiagnostics(diagnostics: readonly ts.Diagnostic[]) {
    console.log(ts.formatDiagnosticsWithColorAndContext(diagnostics, diagnosticHost).trimEnd());
}

function reportDiagnostic(diagnostic: ts.Diagnostic) {
    reportDiagnostics([diagnostic]);
}

function getSys(engines: string[], outDir: string): ts.System {
    const baseDir = path.join(outDir, 'src');
    return {
        ...ts.sys,
        writeFile(dest, content, bom) {
            const relPath = path.relative(baseDir, dest);
            console.log(`[typescript] Recompiled file src/${relPath}`);
            for (const engine of engines) {
                const destPath = path.join('build', engine, relPath);
                ts.sys.writeFile(destPath, content, bom);
            }
        },
    };
}

function readConfig(sys: ts.System, configPath: string): [number, ts.ParsedCommandLine | null] {
    const configJsonResult = ts.readConfigFile(configPath, sys.readFile);
    const configJson = configJsonResult.config;
    if (!configJson) {
        if (configJsonResult.error) {
            reportDiagnostic(configJsonResult.error);
        }

        return [1, null];
    }

    const configResult = ts.parseJsonConfigFileContent(configJson, sys, path.dirname(configPath));
    if (configResult.errors.length > 0) {
        reportDiagnostics(configResult.errors);
    }
    return [configResult.errors.length, configResult];
}

export async function typecheckSubproject(configPath: string): Promise<number> {
    try {
        const [configErrors, config] = readConfig(ts.sys, configPath);
        if (!config) {
            return configErrors;
        }

        config.options.noEmit = true;

        const program = ts.createProgram(config.fileNames, config.options);
        const diagnostics = ts.getPreEmitDiagnostics(program).concat(program.emit().diagnostics);
        reportDiagnostics(diagnostics);

        return configErrors + diagnostics.length;
    } catch (error) {
        console.error(error);
        return 1;
    }
}

export async function typecheckAll(): Promise<number> {
    return (await typecheckSubproject('scripts/tsconfig.json')) + (await typecheckSubproject('tsconfig.json'));
}

const transformers = {
    before: [rewriteImportsTransform],
    after: [removeAnnoyingDefaultExportTransform],
};

// TODO currently we implement build/watch mode specific options (like incremental or noEmitOnError) by changing their
// default value, and not specifying them in tsconfig.json. This means it would be possible to accidentally override
// them if we add them to the tsconfig.json.
// Instead we should probably force those values, but I haven't found a nice way to do that.
// It seems createProgram takes the compiler options as an argument, so that might be the customization point.
// Writing a custom wrapper function around createEmitAndSemanticDiagnosticsBuilderProgram that changes the options.
// If that is done, perhaps we might also only want to generate sourcemaps in watch mode.

export async function compileAll(engines: string[]): Promise<boolean> {
    const [_configErrors, config] = readConfig(ts.sys, 'tsconfig.json');
    if (!config) {
        return false;
    }

    const host = ts.createSolutionBuilderHost(
        getSys(engines, config.options.outDir ?? 'build'),
        ts.createEmitAndSemanticDiagnosticsBuilderProgram,
        reportDiagnostic,
        reportDiagnostic,
    );

    const builder = ts.createSolutionBuilder(host, config.options.rootDirs ?? ['.'], {
        noEmitOnError: true,
        incremental: false,
    });

    const exitStatus = builder.build(undefined, undefined, undefined, _project => transformers);

    return exitStatus === ts.ExitStatus.Success;
}

export async function watch(engines: string[]) {
    const [_configErrors, config] = readConfig(ts.sys, 'tsconfig.json');
    if (!config) {
        return false;
    }

    const host = ts.createSolutionBuilderWithWatchHost(
        getSys(engines, config.options.outDir ?? 'build'),
        ts.createEmitAndSemanticDiagnosticsBuilderProgram,
        reportDiagnostic,
        reportDiagnostic,
        reportDiagnostic,
    );

    const builder = ts.createSolutionBuilderWithWatch(
        host,
        config.options.rootDirs ?? ['.'],
        {
            noEmitOnError: false,
            incremental: true,
        },
        undefined,
    );

    const exitStatus = builder.build(undefined, undefined, undefined, _project => transformers);

    return exitStatus === ts.ExitStatus.Success;
}
