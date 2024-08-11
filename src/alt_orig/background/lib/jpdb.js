import { loadConfig } from "../config.js";

/**
 * @typedef {Enum} JPDBCardState The state of the card
 * @property {string} notInDeck The card is unknown
 * @property {string} blacklisted The card is blacklisted
 * @property {string} suspended The card is suspended
 * @property {string} redundant The card is redundant
 * @property {string} neverForget The card is marked as never forget
 *
 * @typedef {number} vocabulary_index The index of the vocabulary in the vocabulary array
 * @typedef {number} position The position of the token in the text
 * @typedef {number} length The length of the token in the text
 * @typedef {([string, string])[] | null} furigana The furigana of the token
 *
 * @typedef {[
 *  vocabulary_index,
 *  position,
 *  length,
 *  furigana
 * ]} Token
 *
 * @typedef {number} vid The vocabulary ID
 * @typedef {number} sid The sentence ID
 * @typedef {number} rid The reading ID
 * @typedef {string} spelling The spelling of the vocabulary
 * @typedef {string} reading The reading of the vocabulary
 * @typedef {number} frequency_rank The frequency rank of the vocabulary
 * @typedef {string[]} part_of_speech The part of speech of the vocabulary
 * @typedef {string[]} meanings_chunks The meanings of the vocabulary
 * @typedef {string[]} meanings_part_of_speech The part of speech of the meanings
 * @typedef {JPDBCardState[]} card_state The state of the card
 * @typedef {string[] | null} pitch_accent The pitch accent of the vocabulary
 *
 * @typedef {[
 *  vid,
 *  sid,
 *  rid,
 *  spelling,
 *  reading,
 *  frequency_rank,
 *  part_of_speech,
 *  meanings_chunks,
 *  meanings_part_of_speech,
 *  card_state,
 *  pitch_accent
 * ]} Vocabulary The vocabulary
 *
 * @typedef {Object} Meaning
 * @property {string[]} glosses The glosses of the meaning
 * @property {string} partOfSpeech The part of speech of the meaning
 *
 * @typedef {Object} JPDBCard
 * @property {string} vid The vocabulary ID
 * @property {string} sid The sentence ID
 * @property {string} rid The reading ID
 * @property {string} spelling The spelling of the vocabulary
 * @property {string} reading The reading of the vocabulary
 * @property {string} frequencyRank The frequency rank of the vocabulary
 * @property {string[]} partOfSpeech The part of speech of the vocabulary
 * @property {Meaning[]} meanings The meanings of the vocabulary
 * @property {JPDBCardState[]} cardState The state of the card
 * @property {string[]} pitchAccent The pitch accent of the vocabulary
 * @property {string | null} wordWithReading The word with reading
 *
 * @typedef {Object} Ruby
 * @property {string} text The text of the ruby
 * @property {number} start The start position of the ruby
 * @property {number} end The end position of the ruby
 * @property {number} length The length of the ruby
 *
 * @typedef {Object} JPDBToken
 * @property {JPDBCard} card The card of the token
 * @property {number} start The start position of the token
 * @property {number} end The end position of the token
 * @property {number} length The length of the token
 * @property {Ruby[]} rubies The furigana of the token
 */

/**
 * The JPDB class provides an interface to the JPDB API
 */
class JPDB {
  PARSE_ENDPOINT = "https://jpdb.io/api/v1/parse";
  TOKEN_FIELDS = ["vocabulary_index", "position", "length", "furigana"];
  VOCAB_FIELDS = [
    "vid",
    "sid",
    "rid",
    "spelling",
    "reading",
    "frequency_rank",
    "part_of_speech",
    "meanings_chunks",
    "meanings_part_of_speech",
    "card_state",
    "pitch_accent",
  ];

  constructor() {
    this.config = loadConfig();
  }

  /**
   * Parse an array of paragraphs into tokens and vocabulary
   *
   * @param {string[]} paragraphs
   * @returns {Promise<{ tokens: Token[][], vocabulary: Vocabulary[] }>} The parsed tokens and vocabulary
   * @throws {Error} If the request fails or the response contains an error
   */
  async invokeParse(paragraphs) {
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.config.apiToken}`,
        Accept: "application/json",
      },
      body: JSON.stringify({
        text: paragraphs,
        // furigana: [[position, length reading], ...] // TODO pass furigana to parse endpoint
        position_length_encoding: "utf16",
        token_fields: this.TOKEN_FIELDS,
        vocabulary_fields: this.VOCAB_FIELDS,
      }),
    };

    const response = await fetch("https://jpdb.io/api/v1/parse", options);

    if (!(200 <= response.status && response.status <= 299)) {
      const data = await response.json();

      throw Error(
        `${data.error_message} while parsing 「${this.truncate(
          paragraphs.join(" "),
          20
        )}」`
      );
    }

    return await response.json();
  }

  /**
   * Transform vocabulary into JPDB cards
   *
   * @param {Vocabulary[]} vocabulary The vocabulary to transform
   * @returns {JPDBCard[]} The transformed cards
   */
  createCards(vocabulary) {
    return vocabulary.map((vocab) => {
      const [
        vid,
        sid,
        rid,
        spelling,
        reading,
        frequencyRank,
        partOfSpeech,
        meaningsChunks,
        meaningsPartOfSpeech,
        cardState,
        pitchAccent,
      ] = vocab;

      return {
        vid,
        sid,
        rid,
        spelling,
        reading,
        frequencyRank,
        partOfSpeech,
        meanings: meaningsChunks.map((glosses, i) => ({
          glosses,
          partOfSpeech: meaningsPartOfSpeech[i],
        })),
        cardState: cardState?.map((state) => this.toPascalCase(state)) ?? [
          "notInDeck",
        ],
        pitchAccent: pitchAccent ?? [],
        wordWithReading: null,
      };
    });
  }

  /**
   * Parse tokens into furigana information from cards
   *
   * @param {Token[][]} tokens The tokens to parse
   * @param {JPDBCard[]} cards The cards to reference and extend
   * @returns {JPDBToken[][]} The parsed tokens
   */
  parseTokens(tokens, cards) {
    return tokens.map((innerTokens) =>
      innerTokens.map((token) => {
        const [vocabularyIndex, position, length, furigana] = token;
        const card = cards[vocabularyIndex];

        let offset = position;

        const rubies =
          furigana === null
            ? []
            : furigana.flatMap((part) => {
                if (typeof part === "string") {
                  offset += part.length;

                  return [];
                }

                const [base, ruby] = part;
                const start = offset;
                const length = base.length;
                const end = (offset = start + length);

                return { text: ruby, start, end, length };
              });

        const result = {
          card,
          start: position,
          end: position + length,
          length: length,
          rubies,
        };

        this.assignWordWithReading(result);

        return result;
      })
    );
  }

  /**
   * Convert a token to a word with reading and assign it to the referenced card
   *
   * @param {JPDBToken} token The token to convert
   * @returns {void}
   */
  assignWordWithReading(token) {
    const { card, rubies: ruby, start: offset } = token;
    const { spelling: kanji } = card;

    if (!ruby.length) {
      return null;
    }

    const word = kanji.split("");

    for (let i = ruby.length - 1; i >= 0; i--) {
      const { text, start, length } = ruby[i];

      word.splice(start - offset + length, 0, `[${text}]`);
    }

    card.wordWithReading = word.join("");
  }

  toPascalCase(str) {
    return str.replace(/(?:^|\s)\S/g, (a) => a.toUpperCase());
  }

  truncate(string, maxLength) {
    return string.length <= maxLength
      ? string
      : string.slice(0, maxLength - 1) + "…";
  }
}

export let jpdb = new JPDB();
