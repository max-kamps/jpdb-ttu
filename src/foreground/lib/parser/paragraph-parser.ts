export class ParagraphParser {
  constructor(private _paragraphs: Paragraph[]) {}

  public parse(): void {
    if (!this._paragraphs.length) {
      return;
    }

    const text = this._paragraphs
      .map((paragraph) => paragraph.map((fragment) => fragment.node.data).join(''))
      .join('');
    // console.log(text);
  }
}
