export class ParagraphResolver {
  protected _offset = 0;

  protected _fragments: Fragment[] = [];
  protected _paragraphs: Paragraph[] = [];

  constructor(private _root: Node, private _filter: (node: Node) => boolean = () => true) {}

  public resolve(): Paragraph[] {
    this.resolveRecursive(this._root, false);

    return this._paragraphs;
  }

  private resolveRecursive(node: Node, hasRuby: boolean): void {
    const category = this.displayCategory(node);

    // A block category mostly indicates a new paragraph
    // We break the paragraph here, but then continue (in a new one)
    if (category === 'block') {
      this.breakParagraph();
    }

    // Ignore nodes that are not displayed or are ruby-text
    // Also ignore nodes that are filtered out
    if (['none', 'ruby-text'].includes(category) || !this._filter(node)) {
      return;
    }

    // Text nodes do not have children - we add the text and exit the recursion
    if (category === 'text') {
      return this.pushText(node as Text, hasRuby);
    }

    // We have a ruby element, so we need to set the flag and carry it through the recursion (as everything following is inside the current node)
    if (category === 'ruby') {
      hasRuby = true;
    }

    // Recurse through the children of the node
    for (const child of node.childNodes) {
      this.resolveRecursive(child, hasRuby);
    }

    // If we have a block category, we break the paragraph again
    // This is to capture both start and end of the block element
    if (category === 'block') {
      this.breakParagraph();
    }
  }

  private breakParagraph() {
    // Remove fragments from the end that are just whitespace
    // (the ones from the start have already been ignored in this.pushText())
    let end = this._fragments.length - 1;

    // Find the last non-whitespace fragment
    for (; end >= 0; end--) {
      if (this._fragments[end].node.data.trim().length > 0) {
        break;
      }
    }

    // Slice the fragments to the last non-whitespace fragment
    const trimmedFragments = this._fragments.slice(0, end + 1);

    // If there are any fragments left, add them to the list of paragraphs
    if (trimmedFragments.length) {
      this._paragraphs.push(trimmedFragments);
    }

    // Clear the fragments and reset the offset
    this._fragments = [];
    this._offset = 0;
  }

  private pushText(text: Text, hasRuby: boolean): void {
    // Ignore empty text nodes, as well as whitespace at the beginning of the run
    if (text.data.length > 0 && !(this._fragments.length === 0 && text.data.trim().length === 0)) {
      this._fragments.push({
        start: this._offset,
        length: text.length,
        end: (this._offset += text.length),
        node: text,
        hasRuby,
      });
    }
  }

  private displayCategory(node: Node): string {
    if (node instanceof Text || node instanceof CDATASection) {
      return 'text';
    } else if (node instanceof Element) {
      const display = getComputedStyle(node).display.split(/\s/g);
      if (display[0] === 'none') return 'none';
      // NOTE Workaround for Chrome not supporting multi-value display and display: ruby
      if (node.tagName === 'RUBY') return 'ruby';
      if (node.tagName === 'RP') return 'none';
      if (node.tagName === 'RT') return 'ruby-text';
      if (node.tagName === 'RB') return 'inline';
      // Not sure how `inline list-item` or `list-item inline` should behave
      // These are roughly ordered by the frequency I expect them to show up
      if (display.some((x) => x.startsWith('block'))) return 'block';
      if (display.some((x) => x.startsWith('inline'))) return 'inline';
      if (display[0] === 'flex') return 'block';
      if (display[0] === '-webkit-box') return 'block'; // Old name of flex? Still used on Google Search for some reason.
      if (display[0] === 'grid') return 'block';
      if (display[0].startsWith('table')) return 'block';
      if (display[0].startsWith('flow')) return 'block';
      if (display[0] === 'ruby') return 'ruby';
      if (display[0].startsWith('ruby-text')) return 'ruby-text';
      if (display[0].startsWith('ruby-base')) return 'inline';
      if (display[0].startsWith('math')) return 'inline';
      if (display.includes('list-item')) return 'block';
      // Questionable
      if (display[0] === 'contents') return 'inline';
      if (display[0] === 'run-in') return 'block';
      alert(`Warning: Unknown display value ${display.join(' ')}, please report this!`);
      return 'none';
    } else {
      return 'none';
    }
  }
}
