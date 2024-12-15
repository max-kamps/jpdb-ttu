import { Fragment, Paragraph } from './types';

function displayCategory(
  node: Element | Node,
): 'none' | 'text' | 'ruby' | 'ruby-text' | 'block' | 'inline' {
  if (node instanceof Text || node instanceof CDATASection) {
    return 'text';
  }

  if (node instanceof Element) {
    const display = getComputedStyle(node).display.split(/\s/g);
    const [first] = display;

    if (first === 'none') {
      return 'none';
    }

    if (node.tagName === 'RUBY') {
      return 'ruby';
    }

    if (node.tagName === 'RP') {
      return 'none';
    }

    if (node.tagName === 'RT') {
      return 'ruby-text';
    }

    if (node.tagName === 'RB') {
      return 'inline';
    }

    if (display.some((x) => x.startsWith('block'))) {
      return 'block';
    }

    if (display.some((x) => x.startsWith('inline'))) {
      return 'inline';
    }

    if (first === 'flex') {
      return 'block';
    }

    if (first === '-webkit-box') {
      return 'block';
    } // Old name of flex? Still used on Google Search for some reason.

    if (first === 'grid') {
      return 'block';
    }

    if (first.startsWith('table')) {
      return 'block';
    }

    if (first.startsWith('flow')) {
      return 'block';
    }

    if (first === 'ruby') {
      return 'ruby';
    }

    if (first.startsWith('ruby-text')) {
      return 'ruby-text';
    }

    if (first.startsWith('ruby-base')) {
      return 'inline';
    }

    if (first.startsWith('math')) {
      return 'inline';
    }

    if (display.includes('list-item')) {
      return 'block';
    }

    if (first === 'contents') {
      return 'inline';
    }

    if (first === 'run-in') {
      return 'block';
    }
  }

  return 'none';
}

function breakParagraph(paragraphs: Paragraph[], fragments: Fragment[]): void {
  // Remove fragments from the end that are just whitespace
  // (the ones from the start have already been ignored)
  let end = fragments.length - 1;

  for (; end >= 0; end--) {
    if (fragments[end].node.data.trim().length > 0) {
      break;
    }
  }

  const trimmedFragments = fragments.slice(0, end + 1);

  if (trimmedFragments.length) {
    paragraphs.push(trimmedFragments);
  }
}

function pushText(
  fragments: Fragment[],
  offset: number,
  text: Text | CDATASection,
  hasRuby: boolean,
): void {
  // Ignore empty text nodes, as well as whitespace at the beginning of the run
  if (text.data.length > 0 && !(fragments.length === 0 && text.data.trim().length === 0)) {
    fragments.push({
      start: offset,
      length: text.length,
      end: (offset += text.length),
      node: text,
      hasRuby,
    });
  }
}

function recurse(
  paragraphs: Paragraph[],
  fragments: Fragment[],
  offset: number,
  node: Element | Node,
  hasRuby: boolean,
  filter?: (node: Element | Node) => boolean,
): void {
  const display = displayCategory(node);
  const checkBlock = (): void => {
    if (display === 'block') {
      breakParagraph(paragraphs, fragments);

      fragments = [];
      offset = 0;
    }
  };

  checkBlock();

  if (display === 'none' || display === 'ruby-text' || filter?.(node) === false) {
    return;
  }

  if (display === 'text') {
    return pushText(fragments, offset, node as Text | CDATASection, hasRuby);
  }

  if (display === 'ruby') {
    hasRuby = true;
  }

  for (const child of node.childNodes) {
    recurse(paragraphs, fragments, offset, child, hasRuby, filter);
  }

  if (display === 'block') {
    checkBlock();
  }
}

export const getParagraphs = (
  node: Element | Node,
  filter?: (node: Element | Node) => boolean,
): Paragraph[] => {
  const fragments: Fragment[] = [];
  const paragraphs: Paragraph[] = [];

  recurse(paragraphs, fragments, 0, node, false, filter);

  return paragraphs;
};
