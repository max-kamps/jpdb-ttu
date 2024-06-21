import { install } from '@foreground/lib/install';
import { Parser } from '../lib/parser/parser';

install('parser', () => {
  new Parser().install();
});
