import { JPDBToken } from '@shared/jpdb';
import { sendToBackground } from '@shared/messages';
import { IntegrationScript } from '../../integration-script';
import { AbortableSequence } from '../../types';
import { applyTokens } from './apply-tokens';
import { getParagraphs } from './get-paragraphs';
import { Paragraph } from './types';

/**
 * The BatchController is a class that manages the parsing of nodes.
 *
 * Nodes will be split in fragments, which will then be parsed in batches. Those batches can be canceled if they are no longer needed.
 */
export class BatchController extends IntegrationScript {
  protected batches = new Map<
    Element | Node,
    { abort: () => void; sent: boolean; sequences: AbortableSequence<JPDBToken[], Paragraph>[] }
  >();

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

    const paragraphs = getParagraphs(node, filter);

    if (!paragraphs.length) {
      onEmpty?.(node);

      return;
    }

    this.prepareParagraphs(node, paragraphs);
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

    this.batches.get(node)!.abort();
    this.batches.delete(node);
  }

  /** Parse all nodes and its batches that are registered, but not yet started */
  public parseBatches(): void {
    const batches = Array.from(this.batches.values()).filter((b) => !b.sent);
    const sequences = batches.flatMap((b) => b.sequences);
    const sequenceData = sequences.map(
      (s) => [s.sequence, s.data.map((f) => f.node.data).join('')] as [number, string],
    );

    sequences.forEach((s) => {
      void s.promise.then((tokens) => {
        applyTokens(s.data, tokens);
      });
    });

    void sendToBackground('parse', sequenceData);
  }

  protected prepareParagraphs(node: Element | Node, paragraphs: Paragraph[]): void {
    const batches = paragraphs.map((p) => this.getAbortableSequence<JPDBToken[], Paragraph>(p));

    this.batches.set(node, {
      sent: false,
      sequences: batches,
      abort: () => batches.forEach((b) => b.abort()),
    });
  }
}
