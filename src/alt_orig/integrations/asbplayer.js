(async () => {
    "use strict";
    const $browser = globalThis.browser ?? globalThis.chrome, $import = path => import($browser.runtime.getURL(path));
    const { ParseBatch, requestParse } = await $import("/content/background_comms.js");
    const { showError } = await $import("/content/toast.js");
    const { addedObserver, paragraphsInNode, parseParagraphs } = await $import("/integrations/common.js");
    addStyles();
    try {
        const added = addedObserver('.asbplayer-offscreen', async (elements) => {
            const batches = [];
            const promises = [];
            for (const element of elements) {
                const paragraphs = paragraphsInNode(element);
                if (paragraphs.length > 0) {
                    const [elemBatches, applied] = parseParagraphs(paragraphs);
                    batches.push(...elemBatches);
                    promises.push(...applied);
                }
            }
            if (batches.length > 0) {
                requestParse(batches);
                await Promise.allSettled(promises);
            }
        });
        added.observe(document.body, {
            subtree: true,
            childList: true,
        });
    }
    catch (error) {
        showError(error);
    }
    function addStyles() {
        const sheet = (function () {
            const style = document.createElement('style');
            style.appendChild(document.createTextNode(''));
            document.head.appendChild(style);
            return style.sheet;
        })();
        // ensure jpdb-popup is displayed on top of subtitles
        sheet.insertRule('.asbplayer-subtitles-container-bottom { z-index: 2147483646 }', 0);
    }
})();
