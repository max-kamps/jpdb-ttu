import { parseParagraphs } from '@foreground/to-background/parse-paragraphs';
import { AbortableRequest } from '../request/abortable-request';
import { ParsedParagraphsHandler } from './parsed-paragraphs-handler';

export class ParagraphParseInitializer {
  protected _request: AbortableRequest<void>;

  public get promise(): Promise<void> {
    return this._request;
  }

  constructor(_paragraphs: IdentifyableParagraph[]);
  constructor(_paragraphs: IdentifyableParagraph[], _onDone: () => void, _onCancel: () => void);

  constructor(
    private _paragraphs: IdentifyableParagraph[],
    protected _onDone?: () => void,
    protected _onCancel?: () => void,
  ) {
    this.parse();
  }

  private async parse(): Promise<void> {
    if (!this._paragraphs.length) {
      return;
    }

    this._request = new AbortableRequest<void>(async (sequence: number) => {
      const preparedParagraphs: IdentifyableText[] = this._paragraphs.map(({ id, paragraph }) => ({
        id,
        text: paragraph.map((fragment) => fragment.node.data).join(''),
      }));

      ParsedParagraphsHandler.instance.addSequence(sequence, this._paragraphs);

      await parseParagraphs(sequence, preparedParagraphs);
    });
  }

  public cancel(): void {
    this._request.abort();

    ParsedParagraphsHandler.instance.removeSequence(this._request.sequence);

    this._onCancel?.();
  }
}
