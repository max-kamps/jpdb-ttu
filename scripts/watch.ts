import * as process from 'node:process';
import * as typescript from './common/typescript.js';
import * as resources from './common/resources.js';
import * as manifest from './common/manifest.js';

let engines = process.argv.slice(2);
if (engines.length === 0) engines = ['gecko', 'chromium'];

typescript.watch(engines);
resources.watch(engines);
manifest.watch(engines);
