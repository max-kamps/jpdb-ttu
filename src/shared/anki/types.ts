export type AnkiFieldTemplateName =
  | 'empty'
  | 'spelling'
  | 'reading'
  | 'isKanji'
  | 'meaning'
  | 'sentence'
  | 'sentenceSanitized'
  | 'sound:silence'
  | 'hiragana'
  | 'frequency'
  | 'frequencyStylized';

export type TemplateTarget = {
  template: AnkiFieldTemplateName;
  field: string;
};

export type DeckConfiguration = {
  deck: string;
  model: string;
  proxy: boolean;
  wordField: string;
  readingField: string;
  templateTargets: TemplateTarget[];
};

export type DiscoverWordConfiguration = {
  model: string;
  wordField: string;
  deck?: string;
  readingField?: string;
};
