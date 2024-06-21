import { registerListener } from '@lib/messaging';
import { displayToast } from '@lib/toast';

registerListener('toast', displayToast);
