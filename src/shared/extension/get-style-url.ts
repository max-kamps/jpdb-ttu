import { getURL } from './get-url';

export const getStyleUrl = (url: string): string => getURL(`${url}.css`);
