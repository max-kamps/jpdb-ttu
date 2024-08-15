import { Integration } from './lib/integration';

class NjkOrJp extends Integration {
  constructor() {
    super();

    this.setParseBehavior('.article');
  }
}

new NjkOrJp();
