import { registerListener } from '@lib/messaging/register-listener';
import { displayToast } from '@lib/toast';
import { DefaultParser } from '../lib/parsers/default-parser';

registerListener('toast', displayToast);

registerListener('parse-page', () => DefaultParser.instance.parsePage());
registerListener('parse-selection', () => DefaultParser.instance.parseSelection());
registerListener(
  'paragraph-parsed',
  DefaultParser.instance.onParagraphParsed.bind(DefaultParser.instance),
);
