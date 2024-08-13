import { jsxCreateElement } from '../jsx.js';
import { assertNonNull, browser } from '../util.js';
import { config, requestMine, requestReview } from './background_comms.js';
import { getSentences } from './word.js';
export class Dialog {
    #element;
    #header;
    #sentence;
    #clickStartedOutside;
    #data;
    #contextWidth;
    static #dialog;
    static get() {
        if (!this.#dialog) {
            this.#dialog = new this();
            document.body.appendChild(this.#dialog.#element);
        }
        return this.#dialog;
    }
    constructor() {
        this.#element = (jsxCreateElement("div", { id: 'jpdb-dialog', style: 'all:initial;display:none', onclick: event => {
                event.stopPropagation();
            } }));
        const add = async (rating) => {
            assertNonNull(this.#data);
            await requestMine(this.#data.token.card, addToForq.checked, this.#sentence.innerText.trim() || undefined, translation.innerText.trim() || undefined);
            if (rating) {
                await requestReview(this.#data.token.card, rating);
            }
            this.closeModal();
        };
        const shadow = this.#element.attachShadow({ mode: 'closed' });
        let addToForq;
        let translation;
        shadow.append(jsxCreateElement("link", { rel: 'stylesheet', href: browser.runtime.getURL('/content/dialog.css') }), jsxCreateElement("div", { id: 'modal-wrapper', 
            // We can't use click because then mousedown inside the content and mouseup outside would count as a click
            // That means users might accidentally close the modal while dragging to select the sentence or translation.
            onmousedown: ({ target, currentTarget }) => {
                this.#clickStartedOutside = target === currentTarget;
            }, onmouseup: ({ target, currentTarget }) => {
                if (this.#clickStartedOutside && target === currentTarget) {
                    this.closeModal();
                }
                this.#clickStartedOutside = false;
            } },
            jsxCreateElement("article", { lang: 'ja' },
                (this.#header = jsxCreateElement("div", { id: 'header' })),
                jsxCreateElement("div", null,
                    jsxCreateElement("label", { for: 'sentence' }, "Sentence:"),
                    (this.#sentence = jsxCreateElement("div", { id: 'sentence', role: 'textbox', contenteditable: true })),
                    jsxCreateElement("button", { id: 'add-context', onclick: () => {
                            this.#contextWidth++;
                            this.#sentence.innerText = getSentences(this.#data, this.#contextWidth);
                        } }, "Add surrounding sentences")),
                jsxCreateElement("div", null,
                    jsxCreateElement("label", { for: 'translation' }, "Translation:"),
                    (translation = jsxCreateElement("div", { id: 'translation', role: 'textbox', contenteditable: true }))),
                jsxCreateElement("div", null,
                    jsxCreateElement("label", null,
                        "Also add to FORQ:",
                        ' ',
                        (addToForq = (jsxCreateElement("input", { type: 'checkbox', id: 'add-to-forq', checked: config.forqOnMine }))))),
                jsxCreateElement("div", null,
                    jsxCreateElement("button", { class: 'cancel', onclick: () => this.closeModal() }, "Cancel"),
                    jsxCreateElement("button", { class: 'add', onclick: async () => await add() }, "Add")),
                jsxCreateElement("div", null,
                    "Add and review",
                    jsxCreateElement("button", { class: 'nothing', onclick: async () => await add('nothing') }, "Nothing"),
                    jsxCreateElement("button", { class: 'something', onclick: async () => await add('something') }, "Something"),
                    jsxCreateElement("button", { class: 'hard', onclick: async () => await add('hard') }, "Hard"),
                    jsxCreateElement("button", { class: 'good', onclick: async () => await add('good') }, "Good"),
                    jsxCreateElement("button", { class: 'easy', onclick: async () => await add('easy') }, "Easy")))));
    }
    render() {
        if (this.#data === undefined)
            throw Error("Can't render Dialog without data");
        const card = this.#data.token.card;
        const url = `https://jpdb.io/vocabulary/${card.vid}/${encodeURIComponent(card.spelling)}/${encodeURIComponent(card.reading)}`;
        // FIXME(Security) not escaped
        this.#header.replaceChildren(jsxCreateElement("a", { href: url, target: '_blank' },
            jsxCreateElement("span", { class: 'spelling' }, card.spelling),
            jsxCreateElement("span", { class: 'reading' }, card.spelling !== card.reading ? card.reading : '')));
        this.#sentence.innerText = getSentences(this.#data, this.#contextWidth);
    }
    showModal() {
        this.#element.style.display = 'initial';
    }
    closeModal() {
        this.#element.style.display = 'none';
    }
    setData(data) {
        this.#data = data;
        this.#contextWidth = config.contextWidth;
        this.render();
    }
    showForWord(data) {
        this.setData(data);
        this.showModal();
    }
}
