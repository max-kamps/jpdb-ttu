import { anki } from "./anki.js";
import { parser } from "./parser.js";

import { config } from "./background.js";
const API_RATELIMIT = 0.2; // seconds between requests
// NOTE: If you change these, make sure to change the .map calls down below in the parse function too

const PARTS_OF_SPEECH = {
  n: "Noun",
  pn: "Pronoun",
  pref: "Prefix",
  suf: "Suffix",
  name: "Name",
  "name-fem": "Name (Feminine)",
  "name-male": "Name (Masculine)",
  "name-surname": "Surname",
  "name-person": "Personal Name",
  "name-place": "Place Name",
  "name-company": "Company Name",
  "name-product": "Product Name",
  "adj-i": "Adjective",
  "adj-na": "な-Adjective",
  "adj-no": "の-Adjective",
  "adj-pn": "Adjectival",
  "adj-nari": "なり-Adjective (Archaic/Formal)",
  "adj-ku": "く-Adjective (Archaic)",
  "adj-shiku": "しく-Adjective (Archaic)",
  adv: "Adverb",
  aux: "Auxiliary",
  "aux-v": "Auxiliary Verb",
  "aux-adj": "Auxiliary Adjective",
  conj: "Conjunction",
  cop: "Copula",
  ctr: "Counter",
  exp: "Expression",
  int: "Interjection",
  num: "Numeric",
  prt: "Particle",
  vt: "Transitive Verb",
  vi: "Intransitive Verb",
  v1: "Ichidan Verb",
  "v1-s": "Ichidan Verb (くれる Irregular)",
  v5: "Godan Verb",
  v5u: "う Godan Verb",
  "v5u-s": "う Godan Verb (Irregular)",
  v5k: "く Godan Verb",
  "v5k-s": "く Godan Verb (いく/ゆく Irregular)",
  v5g: "ぐ Godan Verb",
  v5s: "す Godan Verb",
  v5t: "つ Godan Verb",
  v5n: "ぬ Godan Verb",
  v5b: "ぶ Godan Verb",
  v5m: "む Godan Verb",
  v5r: "る Godan Verb",
  "v5r-i": "る Godan Verb (Irregular)",
  v5aru: "る Godan Verb (-ある Irregular)",
  vk: "Irregular Verb (くる)",
  vs: "する Verb",
  vz: "ずる Verb",
  "vs-c": "す Verb (Archaic)",
  v2: "Nidan Verb (Archaic)",
  v4: "Yodan Verb (Archaic)",
  v4k: "",
  v4g: "",
  v4s: "",
  v4t: "",
  v4h: "",
  v4b: "",
  v4m: "",
  v4r: "",
  va: "Archaic",
};

//#region Anki

const ankiCards = {};
const ankiNotes = {};
const ankiWords = {};
const ankiJpdbIDs = {};
const jpdbCards = {};

function invokeAnki(action, params = {}) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.addEventListener("error", () => reject("failed to issue request"));
    xhr.addEventListener("load", () => {
      try {
        const response = JSON.parse(xhr.responseText);
        if (Object.getOwnPropertyNames(response).length != 2) {
          throw "response has an unexpected number of fields";
        }
        if (!response.hasOwnProperty("error")) {
          throw "response is missing required error field";
        }
        if (!response.hasOwnProperty("result")) {
          throw "response is missing required result field";
        }
        if (response.error) {
          throw response.error;
        }
        resolve(response.result);
      } catch (e) {
        reject(e);
      }
    });

    xhr.open("POST", config.ankiUrl);
    xhr.send(JSON.stringify({ action, version: 6, params }));
  });
}

function getAnkiCardState(card) {
  const {
    isDue,
    isSuspended,
    isMature,
    isNew,
    isLearning,
    isBlacklisted,
    isNeverForget,
    isUserBuried,
    isSchedBuried,
  } = card;

  if (isBlacklisted) return "blacklisted";
  if (isNeverForget) return "never-forget";
  if (isSuspended) return "leeched";
  if (isUserBuried || isSchedBuried) return "buried";
  if (isNew) return "new";
  if (isDue) return "due";
  if (isMature) return "known";
  if (isLearning) return "learning";
  return "unknown";
}

function getAnkiStatePriority(card) {
  const state = getAnkiCardState(card);
  const map = {
    blacklisted: Infinity,
    "never-forget": Infinity,
    known: Infinity,
    due: 3,
    learning: 2,
    new: 1,
    buried: 0,
    suspended: 0,
  };

  if (map[state] === Infinity) return Infinity;

  return map[state] * 1000 + card.interval;
}

async function loadCardsFromQuery(query) {
  const cardIDs = await anki.invoke("findCards", { query });
  const suspended = await invokeAnki("areSuspended", { cards: cardIDs });
  const due = await invokeAnki("areDue", { cards: cardIDs });

  const cardsInfo = await invokeAnki("cardsInfo", {
    cards: cardIDs,
  });

  cardsInfo.forEach((card) => {
    const { cardId, deckName, interval, note, queue, type, fields } = card;
    const { Word } = fields;
    const index = cardIDs.indexOf(cardId);
    const isDue = due[index];
    const isSuspended = suspended[index];

    const cardItem = Object.assign(
      {
        cardId,
        deckName,
        interval,
        note,
        queue,
        type,
        word: Word?.value,
        source: "anki",
      },
      {
        isDue,
        isSuspended,
        isMature: interval > 21,
        isNew: type === 0,
        isLearning: [1, 3].includes(type), // 1: learning, 3: relearning
        isBlacklisted: deckName === config.blacklistDeckId,
        isNeverForget: deckName === config.neverForgetDeckId,
        isUserBuried: queue === -3,
        isSchedBuried: queue === -2,
        isReview: type === 2 && queue === 2,
      }
    );

    if (cardItem.isReview) {
      // isReview is a pretty broad category - however, it is not clear what it actually means
      // mostly it just means a card is not relearning, but also not mature yet.
      // We'll treat them as learning for now
      cardItem.isLearning = true;
    }

    ankiCards[cardId] = Object.assign(cardItem, {
      state: getAnkiCardState(cardItem),
      priority: getAnkiStatePriority(cardItem),
    });

    if (ankiCards[cardId].state === "unknown") {
      console.error("Unknown card state:", ankiCards[cardId]);
    }
  });

  return cardsInfo;
}

function loadNotesFromCards() {
  const localNotes = Object.groupBy(
    Object.values(ankiCards),
    (card) => card.note
  );

  Object.keys(localNotes).forEach((nid) => {
    const [bestNote] = localNotes[nid]
      .sort((a, b) => a.priority - b.priority)
      .reverse();

    ankiNotes[nid] = bestNote;
  });
}

function loadWordsFromNotes() {
  Object.entries(
    Object.groupBy(Object.values(ankiNotes), (note) => note.word)
  ).forEach(([word, [note]]) => {
    ankiWords[word] = note;
  });
}

function loadJpdbIDsFromNotes(vocabulary) {
  vocabulary.forEach((vocab) => {
    const [vid, sid, rid, spelling] = vocab;
    const card = ankiWords[spelling];

    if (card) {
      card.vid = vid;
      card.sid = sid;

      ankiJpdbIDs[`${vid}-${sid}`] = card;
    } else {
      const item = {
        vid,
        sid,
        state: "not-in-deck",
        word: spelling,
        source: "jpdb",
      };

      ankiJpdbIDs[`${vid}-${sid}`] = item;
      ankiWords[spelling] = item;
    }
  });
}

async function buildAnkiMaps(vocabulary) {
  const query = vocabulary.map((vocab) => `Word:${vocab[3]} `).join(" OR ");

  await loadCardsFromQuery(query);
  loadNotesFromCards();
  loadWordsFromNotes();
  loadJpdbIDsFromNotes(vocabulary);
}

export async function openInAnki(vid, sid, spelling) {
  const card = ankiJpdbIDs[`${vid}-${sid}`];
  const query = card.note ? `nid:${card.note}` : `word:${spelling}`;

  await invokeAnki("guiBrowse", { query });

  return [null, API_RATELIMIT];
}

function sanitizeSentence(sentence) {
  return sentence
    .replace(/[\r\n]+/g, " ")
    .replace(/<\/?br>/g, " ")
    .replace(/（.*?）/g, "")
    .replace(/\(.*?\)/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

//#endregion

export async function parse(text) {
  const data = await parser.parse(text);

  await buildAnkiMaps(data.vocabulary);

  const cards = data.vocabulary.map((vocab) => {
    // NOTE: If you change these, make sure to change VOCAB_FIELDS too
    let [
      vid,
      sid,
      rid,
      spelling,
      reading,
      frequencyRank,
      partOfSpeech,
      meaningsChunks,
      meaningsPartOfSpeech,
      jpdbCardState,
      pitchAccent,
    ] = vocab;

    if (jpdbCardState === null) {
      jpdbCardState = ["suspended"];
    }

    const ankiCard = ankiWords[spelling];
    const ankiCardState = ankiCard.state;
    const relevantJpdbCardState = [
      "blacklisted",
      "suspended",
      "redundant",
    ].includes(jpdbCardState?.[0]);

    const state =
      ankiCardState === "not-in-deck" && relevantJpdbCardState
        ? jpdbCardState
        : [ankiCardState];

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
      state,
      source: ankiCard.source,
      pitchAccent: pitchAccent ?? [], // HACK not documented... in case it can be null, better safe than sorry
    };
  });

  const tokens = data.tokens.map((tokens) =>
    tokens.map((token) => {
      // This is type-safe, but not... variable name safe :/
      // NOTE: If you change these, make sure to change TOKEN_FIELDS too
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
              } else {
                const [base, ruby] = part;
                const start = offset;
                const length = base.length;
                const end = (offset = start + length);
                return { text: ruby, start, end, length };
              }
            });
      return {
        card,
        start: position,
        end: position + length,
        length: length,
        rubies,
      };
    })
  );

  tokens.forEach((token) => {
    if (!token.length) return;

    token.forEach((inner) => {
      if (!inner.rubies.length) return;

      const ruby = inner.rubies;
      const kanji = inner.card.spelling;
      const offset = inner.start;

      const word = kanji.split("");

      for (let i = ruby.length - 1; i >= 0; i--) {
        const { text, start, length } = ruby[i];

        word.splice(start - offset + length, 0, `[${text}]`);
      }

      ankiWords[kanji].furigana = word.join("");
    });
  });

  window.search = (queryOrVid, sid) => {
    if (sid !== undefined) {
      return console.log(ankiJpdbIDs[`${queryOrVid}-${sid}`]);
    }
    const [type, word] = queryOrVid.split(":");
    switch (type) {
      case "note":
        return console.log(ankiNotes[word]);
      case "card":
        return console.log(ankiCards[word]);
      case "word":
      case "Word":
        return console.log(ankiWords[word]);
      default:
        return console.log(ankiWords[queryOrVid]);
    }
  };

  Object.entries(
    Object.groupBy(cards, (card) => `${card.vid}-${card.sid}`)
  ).forEach(([key, value]) => {
    jpdbCards[key] = value[0];
  });

  return [[data.jpdbTokens, cards], API_RATELIMIT];
}

export async function addToDeck(vid, sid, sentence, deckId) {
  const ankiCard = ankiJpdbIDs[`${vid}-${sid}`];
  const jpdbCard = jpdbCards[`${vid}-${sid}`];

  const groupedMeanings = [];
  let lastPOS = [];
  for (const [index, meaning] of jpdbCard.meanings.entries()) {
    if (
      // Same part of speech as previous meaning?
      meaning.partOfSpeech.length == lastPOS.length &&
      meaning.partOfSpeech.every((p, i) => p === lastPOS[i])
    ) {
      // Append to previous meaning group
      groupedMeanings[groupedMeanings.length - 1].glosses.push(meaning.glosses);
    } else {
      // Create a new meaning group
      groupedMeanings.push({
        partOfSpeech: meaning.partOfSpeech,
        glosses: [meaning.glosses],
        startIndex: index,
      });
      lastPOS = meaning.partOfSpeech;
    }
  }

  const meaning = groupedMeanings
    .flatMap((meanings) => [
      `<h2>${meanings.partOfSpeech
        .map((pos) => PARTS_OF_SPEECH[pos] ?? "")
        .filter((x) => x.length > 0)
        .join(", ")}</h2><ol start="${
        meanings.startIndex + 1
      }">${meanings.glosses
        .map((glosses) => `<li>${glosses.join("; ")}</li>`)
        .join("")}</ol>`,
    ])
    .join("");

  const fields = {
    Key: jpdbCard.spelling,
    Word: jpdbCard.spelling,
    WordReading: ankiCard.furigana ?? jpdbCard.reading,
    Kanji: jpdbCard.spelling === jpdbCard.reading ? "" : "1",
    PrimaryDefinition: meaning,
    Sentence: sanitizeSentence(sentence),
    PASilence: "[sound:_silence.wav]",
    WordReadingHiragana: jpdbCard.reading,
    FrequencySort: jpdbCard.frequencyRank?.toString() ?? "",
    FrequenciesStylized: jpdbCard.frequencyRank
      ? `Top ${jpdbCard.frequencyRank}`
      : "",
  };

  fields["Word [jpdb_vocabulary]"] = fields.Word;
  fields["Reading [jpdb_reading]"] = fields.WordReadingHiragana;
  fields["Furigana [jpdb_furigana]"] = fields.WordReading;
  fields["Meaning [jpdb_meaning]"] = fields.PrimaryDefinition;
  fields["Ignore [jpdb_ignore]"] = "";

  const tags =
    deckId === config.miningDeckId ? ["breader", "check"] : ["breader"];
  const note = await invokeAnki("addNote", {
    note: {
      deckName: deckId,
      modelName: "JP Mining Note",
      fields,
      options: {
        allowDuplicate: true,
      },
      tags,
    },
  });

  const stateMap = {
    [config.miningDeckId]: ["new"],
    [config.blacklistDeckId]: ["blacklisted"],
    [config.neverForgetDeckId]: ["never-forget"],
  };

  Object.assign(ankiCard, {
    note,
    deckId,
    source: "anki",
    state: stateMap[deckId],
  });
  jpdbCard.source = "anki";

  return [null, API_RATELIMIT];
}

export async function removeFromDeck(vid, sid) {
  const ankiCard = ankiJpdbIDs[`${vid}-${sid}`];
  const jpdbCard = jpdbCards[`${vid}-${sid}`];

  if (ankiCard.note) {
    await invokeAnki("deleteNotes", {
      notes: [ankiCard.note],
    });
  }

  Object.assign(ankiCard, {
    note: null,
    deckId: null,
    source: "jpdb",
    state: ["not-in-deck"],
  });
  jpdbCard.source = "jpdb";

  return [null, API_RATELIMIT];
}

export async function getCardState(vid, sid) {
  const card = ankiJpdbIDs[`${vid}-${sid}`];
  const state = card?.state ?? ["not-in-deck"];
  const source = card?.source ?? "jpdb";

  return [[state, source], API_RATELIMIT];
}
