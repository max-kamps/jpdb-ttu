import { JPDBToken } from '@shared/jpdb';

// extend the default `document` object with a new property `ajb` that has a property `id` that is a number
export {};

declare global {
  interface Document {
    ajb?: {
      id: number;
    };
  }

  interface HTMLElement {
    ajbContext?: {
      token: JPDBToken;
      context: string;
      contextOffset: number;
    };
  }
}
