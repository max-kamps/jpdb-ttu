export const getTabs = (
  queryInfo: Parameters<typeof chrome.tabs.query>[0],
): Promise<chrome.tabs.Tab[]> => {
  return new Promise((resolve) => {
    chrome.tabs.query(queryInfo, (tabs) => {
      resolve(tabs);
    });
  });
};
