import { install } from '@foreground/lib/install';
import { DOMParser } from '../lib/parser/dom-parser';

install('parser', () => {
  new DOMParser().install();
});
