import { browser, clamp, nonNull } from '../util.js';
import { jsxCreateElement } from '../jsx.js';
import { config, requestMine, requestReview, requestSetFlag } from './background_comms.js';
import { Dialog } from './dialog.js';
import { getSentences } from './word.js';
const PARTS_OF_SPEECH = {
    n: 'Noun',
    pn: 'Pronoun',
    pref: 'Prefix',
    suf: 'Suffix',
    // 'n-adv': '', // Not used in jpdb: n + adv instead. JMDict: "adverbial noun (fukushitekimeishi)"
    // 'n-pr': '', // Not used in jpdb: name instead. JMDict: "proper noun"
    // 'n-pref': '', // Not used in jpdb: n + pref instead. JMDict: "noun, used as a prefix"
    // 'n-suf': '', // Not used in jpdb: n + suf instead. JMDict: "noun, used as a suffix"
    // 'n-t': '', // Not used in jpdb: n instead. JMDict: "noun (temporal) (jisoumeishi)"
    // 'n-pr': '', // JMDict: "proper noun"
    name: 'Name',
    'name-fem': 'Name (Feminine)',
    'name-male': 'Name (Masculine)',
    'name-surname': 'Surname',
    'name-person': 'Personal Name',
    'name-place': 'Place Name',
    'name-company': 'Company Name',
    'name-product': 'Product Name',
    'adj-i': 'Adjective',
    'adj-na': 'な-Adjective',
    'adj-no': 'の-Adjective',
    'adj-pn': 'Adjectival',
    'adj-nari': 'なり-Adjective (Archaic/Formal)',
    'adj-ku': 'く-Adjective (Archaic)',
    'adj-shiku': 'しく-Adjective (Archaic)',
    // 'adj-ix': 'Adjective (いい/よい irregular)', // Not used in jpdb, adj-i instead. JMDict: "adjective (keiyoushi) - yoi/ii class"
    // 'adj-f': '', // Not used in jpdb. JMDict: "noun or verb acting prenominally"
    // 'adj-t': '', // Not used in jpdb. JMDict: "'taru' adjective"
    // 'adj-kari': '', // Not used in jpdb. JMDict: "'kari' adjective (archaic)"
    adv: 'Adverb',
    // 'adv-to': '', // Not used in jpdb: adv instead. JMDict: "adverb taking the `to' particle"
    aux: 'Auxiliary',
    'aux-v': 'Auxiliary Verb',
    'aux-adj': 'Auxiliary Adjective',
    conj: 'Conjunction',
    cop: 'Copula',
    ctr: 'Counter',
    exp: 'Expression',
    int: 'Interjection',
    num: 'Numeric',
    prt: 'Particle',
    // 'cop-da': '',  // Not used in jpdb: cop instead. JMDict: "copula"
    vt: 'Transitive Verb',
    vi: 'Intransitive Verb',
    v1: 'Ichidan Verb',
    'v1-s': 'Ichidan Verb (くれる Irregular)',
    v5: 'Godan Verb',
    v5u: 'う Godan Verb',
    'v5u-s': 'う Godan Verb (Irregular)',
    v5k: 'く Godan Verb',
    'v5k-s': 'く Godan Verb (いく/ゆく Irregular)',
    v5g: 'ぐ Godan Verb',
    v5s: 'す Godan Verb',
    v5t: 'つ Godan Verb',
    v5n: 'ぬ Godan Verb',
    v5b: 'ぶ Godan Verb',
    v5m: 'む Godan Verb',
    v5r: 'る Godan Verb',
    'v5r-i': 'る Godan Verb (Irregular)',
    v5aru: 'る Godan Verb (-ある Irregular)',
    // 'v5uru': '', // JMDict: "Godan verb - Uru old class verb (old form of Eru)"
    vk: 'Irregular Verb (くる)',
    // vn: '', // Not used in jpdb. JMDict: "irregular nu verb"
    // vr: '', // Not used in jpdb. JMDict: "irregular ru verb, plain form ends with -ri"
    vs: 'する Verb',
    vz: 'ずる Verb',
    'vs-c': 'す Verb (Archaic)',
    // 'vs-s': '', // Not used in jpdb. JMDict: "suru verb - special class"
    // 'vs-i': '', // JMDict: "suru verb - included"
    // iv: '',  // Not used in jpdb. JMDict: "irregular verb"
    // 'v-unspec': '', // Not used in jpdb. JMDIct: "verb unspecified"
    v2: 'Nidan Verb (Archaic)',
    // 'v2a-s': '', // Not used in jpdb: v2 instead. JMDict: "Nidan verb with 'u' ending (archaic)"
    // 'v2b-k': '', // Not used in jpdb: v2 instead. JMDict: "Nidan verb (upper class) with 'bu' ending (archaic)"
    // 'v2b-s': '', // Not used in jpdb: v2 instead. JMDict: "Nidan verb (lower class) with 'bu' ending (archaic)"
    // 'v2d-k': '', // Not used in jpdb: v2 instead. JMDict: "Nidan verb (upper class) with 'dzu' ending (archaic)"
    // 'v2d-s': '', // Not used in jpdb: v2 instead. JMDict: "Nidan verb (lower class) with 'dzu' ending (archaic)"
    // 'v2g-k': '', // Not used in jpdb: v2 instead. JMDict: "Nidan verb (upper class) with 'gu' ending (archaic)"
    // 'v2g-s': '', // Not used in jpdb: v2 instead. JMDict: "Nidan verb (lower class) with 'gu' ending (archaic)"
    // 'v2h-k': '', // Not used in jpdb: v2 instead. JMDict: "Nidan verb (upper class) with 'hu/fu' ending (archaic)"
    // 'v2h-s': '', // Not used in jpdb: v2 instead. JMDict: "Nidan verb (lower class) with 'hu/fu' ending (archaic)"
    // 'v2k-k': '', // Not used in jpdb: v2 instead. JMDict: "Nidan verb (upper class) with 'ku' ending (archaic)"
    // 'v2k-s': '', // Not used in jpdb: v2 instead. JMDict: "Nidan verb (lower class) with 'ku' ending (archaic)"
    // 'v2m-k': '', // Not used in jpdb: v2 instead. JMDict: "Nidan verb (upper class) with 'mu' ending (archaic)"
    // 'v2m-s': '', // Not used in jpdb: v2 instead. JMDict: "Nidan verb (lower class) with 'mu' ending (archaic)"
    // 'v2n-s': '', // Not used in jpdb: v2 instead. JMDict: "Nidan verb (lower class) with 'nu' ending (archaic)"
    // 'v2r-k': '', // Not used in jpdb: v2 instead. JMDict: "Nidan verb (upper class) with 'ru' ending (archaic)"
    // 'v2r-s': '', // Not used in jpdb: v2 instead. JMDict: "Nidan verb (lower class) with 'ru' ending (archaic)"
    // 'v2s-s': '', // Not used in jpdb: v2 instead. JMDict: "Nidan verb (lower class) with 'su' ending (archaic)"
    // 'v2t-k': '', // Not used in jpdb: v2 instead. JMDict: "Nidan verb (upper class) with 'tsu' ending (archaic)"
    // 'v2t-s': '', // Not used in jpdb: v2 instead. JMDict: "Nidan verb (lower class) with 'tsu' ending (archaic)"
    // 'v2w-s': '', // Not used in jpdb: v2 instead. JMDict: "Nidan verb (lower class) with 'u' ending and 'we' conjugation (archaic)"
    // 'v2y-k': '', // Not used in jpdb: v2 instead. JMDict: "Nidan verb (upper class) with 'yu' ending (archaic)"
    // 'v2y-s': '', // Not used in jpdb: v2 instead. JMDict: "Nidan verb (lower class) with 'yu' ending (archaic)"
    // 'v2z-s': '', // Not used in jpdb: v2 instead. JMDict: "Nidan verb (lower class) with 'zu' ending (archaic)"
    v4: 'Yodan Verb (Archaic)',
    v4k: '',
    v4g: '',
    v4s: '',
    v4t: '',
    v4h: '',
    v4b: '',
    v4m: '',
    v4r: '',
    // v4n: '', // Not used in jpdb. JMDict: "Yodan verb with 'nu' ending (archaic)"
    va: 'Archaic', // Not from JMDict? TODO Don't understand this one, seems identical to #v4n ?
    // 'unc': '', // Not used in jpdb: empty list instead. JMDict: "unclassified"
};
function getClosestClientRect(elem, x, y) {
    const rects = elem.getClientRects();
    if (rects.length === 1)
        return rects[0];
    // Merge client rects that are adjacent
    // This works around a Chrome issue, where sometimes, non-deterministically,
    // inline child elements will get separate client rects, even if they are on the same line.
    const { writingMode } = getComputedStyle(elem);
    const horizontal = writingMode.startsWith('horizontal');
    const mergedRects = [];
    for (const rect of rects) {
        if (mergedRects.length === 0) {
            mergedRects.push(rect);
            continue;
        }
        const prevRect = mergedRects[mergedRects.length - 1];
        if (horizontal) {
            if (rect.bottom === prevRect.bottom && rect.left === prevRect.right) {
                mergedRects[mergedRects.length - 1] = new DOMRect(prevRect.x, prevRect.y, rect.right - prevRect.left, prevRect.height);
            }
            else {
                mergedRects.push(rect);
            }
        }
        else {
            if (rect.right === prevRect.right && rect.top === prevRect.bottom) {
                mergedRects[mergedRects.length - 1] = new DOMRect(prevRect.x, prevRect.y, prevRect.width, rect.bottom - prevRect.top);
            }
            else {
                mergedRects.push(rect);
            }
        }
    }
    // Debugging this was a nightmare, so I'm leaving this debug code here
    // console.log(rects);
    // console.log(mergedRects);
    // document.querySelectorAll('Rect').forEach(x => x.parentElement?.removeChild(x));
    // document.body.insertAdjacentHTML(
    //     'beforeend',
    //     mergedRects
    //         .map(
    //             (rect, i) =>
    //                 `<Rect style="position:fixed;top:${rect.top}px;left:${rect.left}px;width:${rect.width}px;height:${rect.height}px;background-color:rgba(255,0,0,0.3);box-sizing:border-box;border:solid black 1px;pointer-events:none;">${i}</Rect>`,
    //         )
    //         .join(''),
    // );
    return mergedRects
        .map(rect => ({
        rect,
        distance: Math.max(rect.left - x, 0, x - rect.right) ** 2 + Math.max(rect.top - y, 0, y - rect.bottom) ** 2,
    }))
        .reduce((a, b) => (a.distance <= b.distance ? a : b)).rect;
}
function renderPitch(reading, pitch) {
    if (reading.length != pitch.length - 1) {
        return jsxCreateElement("span", null, "Error: invalid pitch");
    }
    try {
        const parts = [];
        let lastBorder = 0;
        const borders = Array.from(pitch.matchAll(/L(?=H)|H(?=L)/g), x => nonNull(x.index) + 1);
        let low = pitch[0] === 'L';
        for (const border of borders) {
            parts.push(jsxCreateElement("span", { class: low ? 'low' : 'high' }, reading.slice(lastBorder, border)));
            lastBorder = border;
            low = !low;
        }
        if (lastBorder != reading.length) {
            // No switch after last part
            parts.push(jsxCreateElement("span", { class: low ? 'low-final' : 'high-final' }, reading.slice(lastBorder)));
        }
        return jsxCreateElement("span", { class: 'pitch' }, parts);
    }
    catch (error) {
        console.error(error);
        return jsxCreateElement("span", null, "Error: invalid pitch");
    }
}
export class Popup {
    #demoMode;
    #element;
    #customStyle;
    #outerStyle;
    #vocabSection;
    #mineButtons;
    #data;
    static #popup;
    static get() {
        if (!this.#popup) {
            this.#popup = new this();
        }
        this.#popup.updateParent();
        return this.#popup;
    }
    static getDemoMode(parent) {
        const popup = new this(true);
        parent.append(popup.#element);
        return popup;
    }
    constructor(demoMode = false) {
        this.#demoMode = demoMode;
        this.#element = (jsxCreateElement("div", { id: 'jpdb-popup', onmousedown: event => {
                event.stopPropagation();
            }, onclick: event => {
                event.stopPropagation();
            }, onwheel: event => {
                event.stopPropagation();
            }, style: `all:initial;z-index:2147483647;${demoMode ? '' : 'position:absolute;top:0;left:0;opacity:0;visibility:hidden;'};` }));
        const shadow = this.#element.attachShadow({ mode: 'closed' });
        shadow.append(jsxCreateElement("link", { rel: 'stylesheet', href: browser.runtime.getURL('/themes.css') }), jsxCreateElement("link", { rel: 'stylesheet', href: browser.runtime.getURL('/content/popup.css') }), (this.#customStyle = jsxCreateElement("style", null)), jsxCreateElement("article", { lang: 'ja' },
            (this.#mineButtons = jsxCreateElement("section", { id: 'mine-buttons' })),
            jsxCreateElement("section", { id: 'review-buttons' },
                jsxCreateElement("button", { class: 'nothing', onclick: demoMode ? undefined : async () => await requestReview(this.#data.token.card, 'nothing') }, "Nothing"),
                jsxCreateElement("button", { class: 'something', onclick: demoMode ? undefined : async () => await requestReview(this.#data.token.card, 'something') }, "Something"),
                jsxCreateElement("button", { class: 'hard', onclick: demoMode ? undefined : async () => await requestReview(this.#data.token.card, 'hard') }, "Hard"),
                jsxCreateElement("button", { class: 'good', onclick: demoMode ? undefined : async () => await requestReview(this.#data.token.card, 'good') }, "Good"),
                jsxCreateElement("button", { class: 'easy', onclick: demoMode ? undefined : async () => await requestReview(this.#data.token.card, 'easy') }, "Easy")),
            (this.#vocabSection = jsxCreateElement("section", { id: 'vocab-content' }))));
        this.#outerStyle = this.#element.style;
    }
    fadeIn() {
        // Necessary because in settings page, config is undefined
        // TODO is this still true? ~hmry(2023-08-08)
        if (config && !config.disableFadeAnimation) {
            this.#outerStyle.transition = 'opacity 60ms ease-in, visibility 60ms';
        }
        this.#outerStyle.opacity = '1';
        this.#outerStyle.visibility = 'visible';
    }
    fadeOut() {
        // Necessary because in settings page, config is undefined
        // TODO is this still true? ~hmry(2023-08-08)
        if (config && !config.disableFadeAnimation) {
            this.#outerStyle.transition = 'opacity 200ms ease-in, visibility 200ms';
        }
        this.#outerStyle.opacity = '0';
        this.#outerStyle.visibility = 'hidden';
    }
    disablePointer() {
        this.#outerStyle.pointerEvents = 'none';
        this.#outerStyle.userSelect = 'none';
    }
    enablePointer() {
        this.#outerStyle.pointerEvents = '';
        this.#outerStyle.userSelect = '';
    }
    render() {
        if (this.#data === undefined)
            return;
        const card = this.#data.token.card;
        const url = `https://jpdb.io/vocabulary/${card.vid}/${encodeURIComponent(card.spelling)}/${encodeURIComponent(card.reading)}`;
        // Group meanings by part of speech
        const groupedMeanings = [];
        let lastPOS = [];
        for (const [index, meaning] of card.meanings.entries()) {
            if (
            // Same part of speech as previous meaning?
            meaning.partOfSpeech.length == lastPOS.length &&
                meaning.partOfSpeech.every((p, i) => p === lastPOS[i])) {
                // Append to previous meaning group
                groupedMeanings[groupedMeanings.length - 1].glosses.push(meaning.glosses);
            }
            else {
                // Create a new meaning group
                groupedMeanings.push({
                    partOfSpeech: meaning.partOfSpeech,
                    glosses: [meaning.glosses],
                    startIndex: index,
                });
                lastPOS = meaning.partOfSpeech;
            }
        }
        this.#vocabSection.replaceChildren(jsxCreateElement("div", { id: 'header' },
            jsxCreateElement("a", { lang: 'ja', href: url, target: '_blank' },
                jsxCreateElement("span", { class: 'spelling' }, card.spelling),
                jsxCreateElement("span", { class: 'reading' }, card.spelling !== card.reading ? `(${card.reading})` : '')),
            jsxCreateElement("div", { class: 'state' }, card.state.map(s => (jsxCreateElement("span", { class: s }, s))))), jsxCreateElement("div", { class: 'metainfo' },
            jsxCreateElement("span", { class: 'freq' }, card.frequencyRank ? `Top ${card.frequencyRank}` : ''),
            card.pitchAccent.map(pitch => renderPitch(card.reading, pitch))), ...groupedMeanings.flatMap(meanings => [
            jsxCreateElement("h2", null, meanings.partOfSpeech
                .map(pos => PARTS_OF_SPEECH[pos] ?? `(Unknown part of speech #${pos}, please report)`)
                .filter(x => x.length > 0)
                .join(', ')),
            jsxCreateElement("ol", { start: meanings.startIndex + 1 }, meanings.glosses.map(glosses => (jsxCreateElement("li", null, glosses.join('; '))))),
        ]));
        const blacklisted = card.state.includes('blacklisted');
        const neverForget = card.state.includes('never-forget');
        this.#mineButtons.replaceChildren(jsxCreateElement("button", { class: 'add', onclick: this.#demoMode
                ? undefined
                : () => requestMine(this.#data.token.card, config.forqOnMine, getSentences(this.#data, config.contextWidth).trim() || undefined, undefined) }, "Add"), jsxCreateElement("button", { class: 'edit-add-review', onclick: this.#demoMode ? undefined : () => Dialog.get().showForWord(this.#data) }, "Edit, Add and Review..."), jsxCreateElement("button", { class: 'blacklist', onclick: this.#demoMode
                ? undefined
                : async () => await requestSetFlag(this.#data.token.card, 'blacklist', !blacklisted) }, !blacklisted ? 'Blacklist' : 'Remove from blacklist'), jsxCreateElement("button", { class: 'never-forget', onclick: this.#demoMode
                ? undefined
                : async () => await requestSetFlag(this.#data.token.card, 'never-forget', !neverForget) }, !neverForget ? 'Never forget' : 'Unmark as never forget'));
    }
    setData(data) {
        this.#data = data;
        this.render();
    }
    containsMouse(event) {
        const targetElement = event.target;
        if (targetElement) {
            return this.#element.contains(targetElement);
        }
        return false;
    }
    showForWord(word, mouseX = 0, mouseY = 0) {
        const data = word.jpdbData;
        this.setData(data); // Because we need the dimensions of the popup with the new data
        const bbox = getClosestClientRect(word, mouseX, mouseY);
        const wordLeft = window.scrollX + bbox.left;
        const wordTop = window.scrollY + bbox.top;
        const wordRight = window.scrollX + bbox.right;
        const wordBottom = window.scrollY + bbox.bottom;
        // window.innerWidth/Height technically contains the scrollbar, so it's not 100% accurate
        // Good enough for this though
        const leftSpace = bbox.left;
        const topSpace = bbox.top;
        const rightSpace = window.innerWidth - bbox.right;
        const bottomSpace = window.innerHeight - bbox.bottom;
        const popupHeight = this.#element.offsetHeight;
        const popupWidth = this.#element.offsetWidth;
        const minLeft = window.scrollX;
        const maxLeft = window.scrollX + window.innerWidth - popupWidth;
        const minTop = window.scrollY;
        const maxTop = window.scrollY + window.innerHeight - popupHeight;
        let popupLeft;
        let popupTop;
        const { writingMode } = getComputedStyle(word);
        if (writingMode.startsWith('horizontal')) {
            popupTop = clamp(bottomSpace > topSpace ? wordBottom : wordTop - popupHeight, minTop, maxTop);
            popupLeft = clamp(rightSpace > leftSpace ? wordLeft : wordRight - popupWidth, minLeft, maxLeft);
        }
        else {
            popupTop = clamp(bottomSpace > topSpace ? wordTop : wordBottom - popupHeight, minTop, maxTop);
            popupLeft = clamp(rightSpace > leftSpace ? wordRight : wordLeft - popupWidth, minLeft, maxLeft);
        }
        this.#outerStyle.transform = `translate(${popupLeft}px,${popupTop}px)`;
        this.fadeIn();
    }
    updateStyle(newCSS = config.customPopupCSS) {
        this.#customStyle.textContent = newCSS;
    }
    updateParent() {
        const parentElement = this.determineParentElement();
        if (this.#element.parentNode === null || !this.#element.parentNode.isSameNode(parentElement)) {
            parentElement.append(this.#element);
        }
    }
    determineParentElement() {
        const fullscreenVideoElement = this.fullscreenVideoElement();
        if (fullscreenVideoElement) {
            return this.findElementForFullscreenVideoDisplay(fullscreenVideoElement);
        }
        return document.body;
    }
    fullscreenVideoElement() {
        if (!document.fullscreenElement) {
            return undefined;
        }
        const videoElements = document.getElementsByTagName('video');
        if (videoElements.length === 0) {
            return undefined;
        }
        for (const videoElement of videoElements) {
            if (document.fullscreenElement.contains(videoElement)) {
                return videoElement;
            }
        }
        return undefined;
    }
    findElementForFullscreenVideoDisplay(videoElement) {
        const testNode = document.createElement('div');
        testNode.style.position = 'absolute';
        testNode.style.zIndex = '2147483647';
        testNode.innerHTML = '&nbsp;'; // The node needs to take up some space to perform test clicks
        let currentNode = videoElement.parentElement;
        if (!currentNode) {
            return document.body;
        }
        let chosenNode = undefined;
        while (currentNode && !currentNode.isSameNode(document.body.parentElement)) {
            const rect = currentNode.getBoundingClientRect();
            if (rect.height > 0 &&
                (chosenNode === undefined ||
                    rect.height >= chosenNode.getBoundingClientRect().height) &&
                this.elementIsClickableInsideContainer(currentNode, testNode)) {
                chosenNode = currentNode;
                break;
            }
            currentNode = currentNode.parentElement;
        }
        if (chosenNode) {
            return chosenNode;
        }
        return document.body;
    }
    elementIsClickableInsideContainer(container, element) {
        container.appendChild(element);
        const rect = element.getBoundingClientRect();
        const clickedElement = document.elementFromPoint(rect.x, rect.y);
        const clickable = element.isSameNode(clickedElement) || element.contains(clickedElement);
        element.remove();
        return clickable;
    }
}
