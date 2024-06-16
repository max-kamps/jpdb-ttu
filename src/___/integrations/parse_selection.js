(async () => {
    "use strict";
    const $browser = globalThis.browser ?? globalThis.chrome, $import = path => import($browser.runtime.getURL(path));
    const { browser } = await $import("/util.js");
    const { paragraphsInNode, parseParagraphs } = await $import("/integrations/common.js");
    const { requestParse } = await $import("/content/background_comms.js");
    const { showError } = await $import("/content/toast.js");
    // Create the button element
    const parse_page = document.createElement('button');
    parse_page.innerHTML = 'Parse selection';
    Object.assign(parse_page.style, { position: 'fixed', top: '0', right: '0', zIndex: '9999' });
    document.body.appendChild(parse_page);
    parse_page?.addEventListener('click', () => {
        browser.tabs.executeScript({ file: '/integrations/contextmenu.js' });
    });
    try {
        const paragraphs = paragraphsInNode(document.body);
        if (paragraphs.length > 0) {
            const [batches, applied] = parseParagraphs(paragraphs);
            requestParse(batches);
            Promise.allSettled(applied);
        }
    }
    catch (error) {
        showError(error);
    }
})();
