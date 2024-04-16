import * as path from 'node:path';
import ts from 'typescript';
import { rewriteImportsTransform, removeAnnoyingDefaultExportTransform } from '../transformers/content_script.js';

const diagnosticHost: ts.FormatDiagnosticsHost = {
    getCanonicalFileName: (path: string) => path,
    getCurrentDirectory: ts.sys.getCurrentDirectory,
    getNewLine: () => ts.sys.newLine,
};

function reportDiagnostics(diagnostics: readonly ts.Diagnostic[]) {
    console.log(ts.formatDiagnosticsWithColorAndContext(diagnostics, diagnosticHost));
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

export async function compileAll(engines: string[]): Promise<boolean> {
    // TODO it would be really nice if someone can figure out how to make this work with the solution builder API,
    // instead of createProgram. That could cut down on duplication between this function and watch()
    try {
        const [_configErrors, config] = readConfig(ts.sys, 'tsconfig.json');
        if (!config) {
            return false;
        }

        const sys = getSys(engines, config.options.outDir ?? 'build');

        config.options.noEmitOnError = true;
        config.options.incremental = false;

        const program = ts.createProgram(config.fileNames, config.options);
        const emitResult = program.emit(undefined, sys.writeFile, undefined, undefined, transformers);
        const diagnostics = ts.getPreEmitDiagnostics(program).concat(emitResult.diagnostics);
        reportDiagnostics(diagnostics);

        return !emitResult.emitSkipped;
    } catch (error) {
        console.error(error);
        return false;
    }
}

function buildProject(builder: ts.SolutionBuilder<ts.EmitAndSemanticDiagnosticsBuilderProgram>) {
    const project = builder.getNextInvalidatedProject();
    if (project) {
        console.log(
            `[typescript] Invalidated project ${project.project}, kind: ${ts.InvalidatedProjectKind[project.kind]}`,
        );
        if (project.kind == ts.InvalidatedProjectKind.Build) {
            const emitResult = project.emit(undefined, undefined, undefined, undefined, transformers);

            if (emitResult) {
                reportDiagnostics(emitResult.diagnostics);
            }
        }
    }
}

export async function watch(engines: string[]) {
    const [_configErrors, config] = readConfig(ts.sys, 'tsconfig.json');
    if (!config) {
        return false;
    }

    const sys = getSys(engines, config.options.outDir ?? 'build');

    config.options.noEmitOnError = false;
    config.options.incremental = true;

    const host = ts.createSolutionBuilderWithWatchHost(
        sys,
        ts.createEmitAndSemanticDiagnosticsBuilderProgram,
        reportDiagnostic,
        reportDiagnostic,
        diagnostic => {
            reportDiagnostic(diagnostic);
            buildProject(builder);
        },
    );

    const builder = ts.createSolutionBuilderWithWatch(host, config.options.rootDirs ?? ['.'], {}, config.watchOptions);

    buildProject(builder);
    builder.build();

    return true;
}
