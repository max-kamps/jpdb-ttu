export const prepareParser = async (tabId: number): Promise<void> => {
  await chrome.scripting.insertCSS({
    target: { tabId },
    files: ['styles/word.css'],
  });

  await chrome.scripting.executeScript({
    target: { tabId },
    files: ['scripts/install-parser.js'],
  });
};
