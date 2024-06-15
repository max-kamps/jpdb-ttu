(async () => {
    "use strict";
    const $browser = globalThis.browser ?? globalThis.chrome, $import = path => import($browser.runtime.getURL(path));
    const { showError } = await $import("/content/toast.js");
    const { addedObserver, parseVisibleObserver } = await $import("/integrations/common.js");
    try {
        const visible = parseVisibleObserver();
        const added = addedObserver('.textline, .line_box, .sentence-entry, .my-2.cursor-pointer', elements => {
            for (const element of elements)
                visible.observe(element);
        });
        added.observe(document.querySelector('#textlog, #entry_holder, main') ?? document.body, {
            subtree: true,
            childList: true,
        });
    }
    catch (error) {
        showError(error);
    }
})();
