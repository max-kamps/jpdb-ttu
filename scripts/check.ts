import * as eslint from './common/eslint.js';
import * as typescript from './common/typescript.js';
import * as prettier from './common/prettier.js';

console.log('Checking types...');
const typescriptResult = typescript.typecheckAll();
console.log('Linting...');
const eslintResult = await eslint.lint();
console.log('Checking formatting...');
const prettierResult = await prettier.check();

let total = 0;
console.log('Results:');
for (const [name, result] of [
    ['typescript', typescriptResult],
    ['eslint', eslintResult],
    ['prettier', prettierResult],
] as const) {
    console.log(`  [${name}] ${result.errors} error(s) and ${result.warnings} warning(s)`);
    total += result.errors + result.warnings;
}
console.log(total === 0 ? 'Check passed!' : 'Check failed!');
process.exit(total);
