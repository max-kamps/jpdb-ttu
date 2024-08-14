export const getStyleUrl = (url: string): string => {
  return chrome.runtime.getURL(`${url}.css`);
};
