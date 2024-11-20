// @reader content-script

import { showError } from '../content/toast.js';
import { browser } from '../webextension.js';
import { paragraphsInNode, parseParagraphs } from './common.js';

// Create the button element
const parse_page = document.createElement('button');
parse_page.innerHTML = 'Parse selection';
Object.assign(parse_page.style, { position: 'fixed', top: '0', right: '0', zIndex: '9999' });

document.body.appendChild(parse_page);
parse_page?.addEventListener('click', () => {
    // @ts-expect-error TODO
    browser.tabs.executeScript({ file: '/integrations/contextmenu.js' });
});

try {
    const paragraphs = paragraphsInNode(document.body);

    if (paragraphs.length > 0) {
        const [batches, applied] = parseParagraphs(paragraphs);
        // @ts-expect-error TODO batch parsing
        requestParse(batches);
        Promise.allSettled(applied);
    }
} catch (error) {
    showError(error);
}
