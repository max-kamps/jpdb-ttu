// @reader content-script

import { browser } from '../webextension.js';

console.log('Example content script loaded');
const response = await browser.runtime.sendMessage({ test: { eep: 'hello' } });
console.log(response);
