import { BaseParser } from './base-parser';

export class AutomaticParser extends BaseParser {
  protected setup(): void {
    console.log('Automatic parser setup...');
  }
  // public parse(): void {
  //   console.log('Parsing automatic...');
  // }
}
