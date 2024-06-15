import { loadConfig } from "./config.js";
import { anki } from "./anki.js";
import { jpdb } from "./jpdb.js";

class Parser {
  constructor() {
    this.config = loadConfig();
    this.anki = anki;
    this.jpdb = jpdb;
  }

  async parse(paragraphs) {
    const { tokens, vocabulary } = await this.jpdb.invokeParse(paragraphs);

    const jpdbCards = this.jpdb.createCards(vocabulary);
    const jpdbTokens = this.jpdb.parseTokens(tokens, jpdbCards);

    console.log({ paragraphs, tokens, vocabulary, jpdbCards, jpdbTokens });

    return { tokens, jpdbCards, jpdbTokens, vocabulary };
  }
}

export let parser = new Parser();
