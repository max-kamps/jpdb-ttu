import { Empty } from '@shared/types';

type ModelFieldNamesRequest = { modelName: string };

export type AnkiRequestOptions = {
  ankiConnectUrl?: string;
};

export type AnkiEndpoints = {
  version: [Empty, number];
  deckNames: [Empty, string[]];
  modelNames: [Empty, string[]];
  modelFieldNames: [ModelFieldNamesRequest, string[]];
};
