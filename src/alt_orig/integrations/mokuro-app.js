(async () => {
  "use strict";
  const $browser = globalThis.browser ?? globalThis.chrome,
    $import = (path) => import($browser.runtime.getURL(path));
  const { requestParse } = await $import("/content/background_comms.js");
  const { parseParagraphs, visibleObserver, addedObserver } = await $import(
    "/integrations/common.js"
  );

  class MokuroMangaPanel {
    _THRESHOLD = 500;

    constructor(panel) {
      this._panel = panel;
      this._element = document.getElementById("popupAbout");
      this._pendingBatches = new Map();
      this._currentId = 0;

      this._timeout = null;

      // We are mostly interested in the DIV #popupAbout.pageContainer - this contains the background image
      // as a style property - this background image is the manga page currently rendered
      // Because we have no other (simple and reliable) way to determine if the page has changed, we observe this element
      this._elementObserver = new MutationObserver(() => {
        // The actual mutation is not interesting, we just want to know that the page has changed
        // We now can do two things:
        // 1. Clean up the injected jpdb contents from a previous page
        // 2. Parse the new page
        this._currentId++;
        this.trigger();
      });
      this._elementObserver.observe(this._element, {
        attributes: true,
        attributeFilter: ["style"],
      });

      this.trigger();
    }

    destroy() {
      this.cancel();

      this._elementObserver.disconnect();
    }

    trigger() {
      // This is a simple debouncing mechanism to avoid parsing the page multiple times
      // The flow is as follows:
      // 1. The page changes
      // 2. The observer triggers
      // 3. The trigger function is called
      // 4. The trigger function checks if the last parse attempt was less than this._THRESHOLD MS ago
      // 5. If it was, the current parse attempt is cancelled and a new one is scheduled
      // 6. If it wasn't, the current parse attempt is permitted
      // This allows the user to navigate to another page without triggering a parse attempt

      console.log("MokuroMangaPanel.trigger");

      if (this._timeout) {
        clearTimeout(this._timeout);

        this.cancel();

        this._timeout = setTimeout(() => {
          this._timeout = null;

          this.initParse();
        }, this._THRESHOLD);

        return;
      }

      this.initParse();

      this._timeout = setTimeout(() => {
        this._timeout = null;
      }, this._THRESHOLD);
    }

    initParse() {
      console.log("MokuroMangaPanel.initParse");

      this.cleanup();
      this.parse();
    }

    cancel() {
      console.log("MokuroMangaPanel.cancel");

      this._pendingBatches.keys().forEach((element) => {
        element.style.backgroundColor = "rgba(0, 255, 0, 0.3)";

        const batches = this._pendingBatches.get(element);

        for (const { abort } of batches) {
          abort.abort();
        }

        this._pendingBatches.delete(element);
      });
    }

    cleanup() {
      console.log("MokuroMangaPanel.cleanup");
      // Remove all jpdb elements from the page
      // This is necessary to avoid duplication of words when the page changes
      // The jpdb elements are not removed by mokuro itself
      [...this._panel.querySelectorAll(".textBox p")].forEach((p) => {
        if (p.firstChild instanceof Text) return;

        const firstJpdbChild = p.firstChild;
        const textContent = firstJpdbChild.firstChild;

        p.replaceChildren(textContent);
      });
    }

    parse() {
      console.log("MokuroMangaPanel.parse");

      const pages = this._panel.querySelectorAll(":scope > div");
      const batches = [];

      for (const page of pages) {
        if (this._pendingBatches.get(page) !== undefined) continue;

        // Manually create fragments, since mokuro puts every line in a separate <p>aragraph
        const paragraphs = [...page.querySelectorAll(".textBox")].map((box) => {
          const fragments = [];
          let offset = 0;

          for (const p of box.children) {
            if (p.tagName !== "P") continue;

            const text = p.firstChild;

            text.data = text.data
              .replaceAll("．．．", "…")
              .replaceAll("．．", "…")
              .replaceAll("！！", "‼")
              .replaceAll("！？", "“⁉");

            const start = offset;
            const length = text.length;
            const end = (offset += length);

            fragments.push({
              node: text,
              start,
              end,
              length,
              hasRuby: false,
            });
          }

          return fragments;
        });

        if (paragraphs.length === 0) continue;
        const currentId = this._currentId;

        const [pageBatches, applied] = parseParagraphs(
          paragraphs,
          () => currentId === this._currentId
        );

        Promise.all(applied).then(() => {
          this._pendingBatches.delete(page);
          page.style.backgroundColor = "";
        });

        this._pendingBatches.set(page, pageBatches);

        batches.push(...pageBatches);
        page.style.backgroundColor = "rgba(255, 0, 0, 0.3)";
      }

      if (batches.length) requestParse(batches);
    }
  }

  /**
   * The Mokuro Controller observer determines the current context of the web app and controls
   * the management of page parsers.
   */
  class MokuroControllerObserver {
    _observedPanels = new Set();
    _panels = new Map();

    constructor() {
      this._visibleObserver = visibleObserver(
        (elements) => {
          for (const element of elements) {
            this._panels.set(element, new MokuroMangaPanel(element));
          }
        },
        (elements) => {
          for (const element of elements) {
            this._panels.get(element)?.destroy?.();
            this._panels.delete(element);
          }
        }
      );

      // Watch for the #manga-panel element to be added to the DOM - this indicates
      // a) the page has loaded or
      // b) the user has navigated to a manga pagel
      this._addedObserver = addedObserver("#manga-panel", (elements) => {
        for (const element of elements) {
          if (this._observedPanels.has(element)) continue;

          this._visibleObserver.observe(element);
          this._observedPanels.add(element);
        }
      });
      this._addedObserver.observe(document.body, {
        subtree: true,
        childList: true,
      });
    }
  }

  new MokuroControllerObserver();
})();
