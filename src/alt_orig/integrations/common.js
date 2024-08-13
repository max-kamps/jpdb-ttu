import { createParseBatch, requestParse } from "../content/background_comms.js";
import { applyTokens, displayCategory } from "../content/parse.js";
import { showError } from "../content/toast.js";
import { Canceled } from "../util.js";
export function paragraphsInNode(node, filter = () => true) {
  let offset = 0;
  const fragments = [];
  const paragraphs = [];
  function breakParagraph() {
    // Remove fragments from the end that are just whitespace
    // (the ones from the start have already been ignored)
    let end = fragments.length - 1;
    for (; end >= 0; end--) {
      if (fragments[end].node.data.trim().length > 0) break;
    }
    const trimmedFragments = fragments.slice(0, end + 1);
    if (trimmedFragments.length) {
      paragraphs.push(trimmedFragments);
    }
    fragments.splice(0);
    offset = 0;
  }
  function pushText(text, hasRuby) {
    // Ignore empty text nodes, as well as whitespace at the beginning of the run
    if (
      text.data.length > 0 &&
      !(fragments.length === 0 && text.data.trim().length === 0)
    ) {
      fragments.push({
        start: offset,
        length: text.length,
        end: (offset += text.length),
        node: text,
        hasRuby,
      });
    }
  }
  function recurse(node, hasRuby) {
    const display = displayCategory(node);
    if (display === "block") {
      breakParagraph();
    }
    if (display === "none" || display === "ruby-text" || filter(node) === false)
      return;
    if (display === "text") {
      pushText(node, hasRuby);
    } else {
      if (display === "ruby") {
        hasRuby = true;
      }
      for (const child of node.childNodes) {
        recurse(child, hasRuby);
      }
      if (display === "block") {
        breakParagraph();
      }
    }
  }
  // TODO check if any of the parents of node are ruby?
  recurse(node, false);
  return paragraphs;
}
export function visibleObserver(enterCallback, exitCallback) {
  const elementVisibleObserver = new IntersectionObserver(
    (entries, _observer) => {
      try {
        const exited = entries
          .filter((entry) => !entry.isIntersecting)
          .map((entry) => entry.target);
        if (exited.length !== 0) exitCallback(exited);
        const entered = entries
          .filter((entry) => entry.isIntersecting)
          .map((entry) => entry.target);
        if (entered.length !== 0) enterCallback(entered);
      } catch (error) {
        showError(error);
      }
    },
    {
      rootMargin: "50% 50% 50% 50%",
    }
  );
  return elementVisibleObserver;
}
export function addedObserver(selector, callback) {
  const existingElements = document.querySelectorAll(selector);
  if (existingElements.length > 0) {
    callback([...existingElements]);
  }
  const newParagraphObserver = new MutationObserver((mutations, _observer) => {
    for (const mutation of mutations) {
      if (mutation.type !== "childList") continue;
      const filteredNodes = [];
      for (const node of mutation.addedNodes) {
        // TODO support non-elements (like text nodes)
        if (node instanceof HTMLElement) {
          if (node.matches(selector)) {
            filteredNodes.push(node);
          }
          // TODO support non-html elements
          filteredNodes.push(...node.querySelectorAll(selector));
        }
      }
      if (filteredNodes.length) callback(filteredNodes);
    }
  });
  return newParagraphObserver;
}
export function parseVisibleObserver(filter = () => true) {
  const pendingBatches = new Map();
  const visible = visibleObserver(
    (elements) => {
      const batches = [];
      for (const element of elements) {
        if (pendingBatches.get(element) !== undefined) continue;
        const paragraphs = paragraphsInNode(element, filter);
        if (paragraphs.length === 0) {
          visible.unobserve(element);
          continue;
        }
        const [elemBatches, applied] = parseParagraphs(paragraphs);
        Promise.all(applied)
          .then((_) => visible.unobserve(element))
          .finally(() => {
            pendingBatches.delete(element);
          });
        pendingBatches.set(element, elemBatches);
        batches.push(...elemBatches);
      }
      requestParse(batches);
    },
    (elements) => {
      for (const element of elements) {
        const batches = pendingBatches.get(element);
        if (batches) {
          for (const { abort } of batches) abort.abort();
        }
      }
    }
  );
  return visible;
}
export function parseParagraphs(paragraphs, shouldApply = () => true) {
  const batches = paragraphs.map(createParseBatch);
  const applied = batches.map(({ paragraph, promise }) =>
    promise
      .then((tokens) => {
        if (shouldApply()) applyTokens(paragraph, tokens);
      })
      .catch((error) => {
        if (!(error instanceof Canceled)) {
          showError(error);
        }
        throw error;
      })
  );
  return [batches, applied];
}
