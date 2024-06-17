export const cssPath = (name: string) => `styles/${name}.css`;
export const cssURL = (name: string) => chrome.runtime.getURL(cssPath(name));

export const integrationPath = (name: string) => `integrations/${name}.js`;
export const integrationURL = (name: string) => chrome.runtime.getURL(integrationPath(name));
