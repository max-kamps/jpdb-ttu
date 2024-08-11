import { ParagraphParseInitializer } from './paragraph-parse-initializer';
import { ParagraphResolver } from './paragraph-resolver';

export function parseElements(root: Node | Element[]): ParagraphParseInitializer;
export function parseElements(
  root: Node | Element[],
  filter: (node: Node) => boolean,
): ParagraphParseInitializer;
export function parseElements(
  root: Node | Element[],
  onDone: () => void,
  onCancel: () => void,
): ParagraphParseInitializer;
export function parseElements(
  root: Node | Element[],
  filter: (node: Node) => boolean,
  onDone: () => void,
  onCancel: () => void,
): ParagraphParseInitializer;

export function parseElements(
  root: Node | Element[],
  p1?: ((node: Node) => boolean) | (() => void),
  p2?: () => void,
  p3?: () => void,
): ParagraphParseInitializer {
  let filter: (node: Node) => boolean;
  let onDone: () => void;
  let onCancel: () => void;

  if (p3) {
    filter = p1 as (node: Node) => boolean;
    onDone = p2;
    onCancel = p3;
  } else if (p2) {
    filter = () => true;
    onDone = p1 as () => void;
    onCancel = p2;
  } else if (p1) {
    filter = p1 as (node: Node) => boolean;
  } else {
    filter = () => true;
  }

  const paragraphs = (Array.isArray(root) ? root : [root]).flatMap((element) =>
    new ParagraphResolver(element, filter).resolve(),
  );

  if (!paragraphs.length) {
    return;
  }

  return new ParagraphParseInitializer(paragraphs, onDone, onCancel);
}
