/**
 * The BatchController is a class that manages the parsing of nodes.
 *
 * Nodes will be split in fragments, which will then be parsed in batches. Those batches can be canceled if they are no longer needed.
 */
export class BatchController {
  protected batches = new Map<Element | Node, unknown>();

  /**
   * Register a node for later parsing.
   *
   * Prepares the node for parsing by splitting it into fragments and storing them in batches.
   * Also registers the nodes for later manipulation to apply the word state and lookup functionality.
   *
   * @param {Element | Node} node The node to register
   * @param {(node: Element | Node) => boolean} filter A filter for the nodes childnodes. Childnodes that do not pass the filter will not be parsed
   * @param {(node: Element | Node) => void} onEmpty A callback that will be called if the node is empty. Used for example to unobserve the node for visibility
   * @returns {void}
   */
  public registerNode(
    node: Element | Node,
    filter?: (node: Element | Node) => boolean,
    onEmpty?: (node: Element | Node) => void,
  ): void {
    if (this.batches.has(node)) {
      return;
    }

    const paragraphs = this.getParagraphs(node, filter);

    if (!paragraphs.length) {
      onEmpty?.(node);

      return;
    }

    this.prepareParagraphs(node, paragraphs);

    console.log('registerNode', node);
  }

  /**
   * Dismiss a node from parsing.
   *
   * If a node is already parsed, nothing happens.
   * If the parsing is still in progress or about to start, the parsing will be canceled.
   *
   * Used for example if a node is no longer visible in the DOM.
   *
   * @param {Element | Node} node The node to dismiss
   * @returns {void}
   */
  public dismissNode(node: Element | Node): void {
    if (!this.batches.has(node)) {
      return;
    }

    console.log('dismissNode', node);
  }

  /** Parse all nodes and its batches that are registered, but not yet started */
  public parseBatches(): void {
    console.log('parse');
  }

  protected getParagraphs(
    node: Element | Node,
    filter?: (node: Element | Node) => boolean,
  ): unknown[] {
    return [];
  }

  protected prepareParagraphs(node: Element | Node, paragraphs: unknown[]): void {
    console.log('prepareParagraphs', node, paragraphs);
  }
}
