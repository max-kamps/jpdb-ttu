import * as path from 'node:path';
import { stdout } from 'node:process';
import ts from 'typescript';
import { rewriteImportsTransform, removeAnnoyingDefaultExportTransform } from '../transformers/content_script.js';

const transformers = {
    before: [rewriteImportsTransform],
    after: [removeAnnoyingDefaultExportTransform],
};

class DiagnosticCounter {
    warnings = 0;
    errors = 0;

    static diagnosticHost: ts.FormatDiagnosticsHost = {
        getCanonicalFileName: (path: string) => path,
        getCurrentDirectory: ts.sys.getCurrentDirectory,
        getNewLine: () => ts.sys.newLine,
    };

    reportDiagnostic(diagnostic: ts.Diagnostic) {
        if (diagnostic.category === ts.DiagnosticCategory.Warning) {
            this.warnings++;
        } else if (diagnostic.category === ts.DiagnosticCategory.Error) {
            this.errors++;
        }

        stdout.write(ts.formatDiagnosticsWithColorAndContext([diagnostic], DiagnosticCounter.diagnosticHost));
    }
}

function getSys(engines: string[], baseDir: string): ts.System {
    return {
        ...ts.sys,
        writeFile(dest, content, bom) {
            ts.sys.writeFile(dest, content, bom);
            const relPath = path.relative(baseDir, dest);
            if (relPath.startsWith('..')) return;
            console.log(`[typescript] Recompiled file src/${relPath}`);
            for (const engine of engines) {
                const destPath = path.join('build', engine, relPath);
                ts.sys.writeFile(destPath, content, bom);
            }
        },
    };
}

// TODO currently we implement build/watch mode specific options (like incremental or noEmitOnError) by changing their
// default value, and not specifying them in tsconfig.json. This means it would be possible to accidentally override
// them if we add them to the tsconfig.json.
// Instead we should probably force those values, but I haven't found a nice way to do that.
// It seems createProgram takes the compiler options as an argument, so that might be the customization point.
// Writing a custom wrapper function around createEmitAndSemanticDiagnosticsBuilderProgram that changes the options.
// If that is done, perhaps we might also only want to generate sourcemaps in watch mode.

export function typecheckAll(): { warnings: number; errors: number } {
    const diagnostics = new DiagnosticCounter();
    const host = ts.createSolutionBuilderHost(
        ts.sys,
        ts.createSemanticDiagnosticsBuilderProgram,
        diagnostics.reportDiagnostic.bind(diagnostics),
        diagnostics.reportDiagnostic.bind(diagnostics),
    );
    const builder = ts.createSolutionBuilder(host, ['.', './scripts'], {
        incremental: false,
    });
    builder.build();
    return diagnostics;
}

export function compileAll(engines: string[]): { warnings: number; errors: number } {
    const diagnostics = new DiagnosticCounter();
    const host = ts.createSolutionBuilderHost(
        getSys(engines, 'build/src'),
        ts.createEmitAndSemanticDiagnosticsBuilderProgram,
        diagnostics.reportDiagnostic.bind(diagnostics),
        diagnostics.reportDiagnostic.bind(diagnostics),
    );
    const builder = ts.createSolutionBuilder(host, ['.'], {
        noEmitOnError: true,
        incremental: false,
    });
    builder.build(undefined, undefined, undefined, _project => transformers);
    return diagnostics;
}

export function watch(engines: string[]) {
    const diagnostics = new DiagnosticCounter();
    const host = ts.createSolutionBuilderWithWatchHost(
        getSys(engines, 'build/src'),
        ts.createEmitAndSemanticDiagnosticsBuilderProgram,
        diagnostics.reportDiagnostic.bind(diagnostics),
        diagnostics.reportDiagnostic.bind(diagnostics),
        diagnostics.reportDiagnostic.bind(diagnostics),
    );
    host.getCustomTransformers = () => transformers;
    const builder = ts.createSolutionBuilderWithWatch(host, ['.'], {
        noEmitOnError: false,
        incremental: true,
    });
    builder.build();
}
