export class ParagraphParser {
  protected _onDoneCallback?: () => void;
  protected _timeout: NodeJS.Timeout;
  protected _resolve: (value: string) => void;

  constructor(
    private _paragraphs: Paragraph[],
    protected _onDone?: () => void,
    protected _onCancel?: () => void,
  ) {}

  public parse(): Promise<string> {
    if (!this._paragraphs.length) {
      return;
    }

    const text = this._paragraphs
      .map((paragraph) => paragraph.map((fragment) => fragment.node.data).join(''))
      .join('');

    return new Promise((resolve) => {
      this._resolve = resolve;
      this._timeout = setTimeout(() => {
        this._resolve(text);

        this._onDone?.();
      }, 1000);
    });
  }

  public cancel(): void {
    clearTimeout(this._timeout);

    this._resolve(undefined);
    this._onCancel?.();
  }
}
