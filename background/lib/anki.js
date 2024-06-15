import { loadConfig } from "../config.js";

class Anki {
  constructor() {
    this.config = loadConfig();
  }

  invoke(action, params = {}) {
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

      xhr.open("POST", this.config.ankiUrl);
      xhr.send(JSON.stringify({ action, version: 6, params }));
    });
  }

  getCardState(card) {
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

  getStatePriority(card) {
    const state = this.getCardState(card);
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
}

export let anki = new Anki();
